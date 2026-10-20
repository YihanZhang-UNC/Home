
        const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;
        const { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useTransform } = window.Motion;

        // --- ENHANCED CUSTOM CURSOR (Trail duration changed to 500ms) ---
        const CustomCursor = () => {
            const [enabled,setEnabled]=useState(false);
            useEffect(()=>{const media=window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');const sync=()=>setEnabled(media.matches);sync();media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync);},[]);
            const cursorRef = useRef(null);
            const pathRef = useRef(null);
            const pointsRef = useRef([]);

            const [isHovering, setIsHovering] = useState(false);
            const [isClicking, setIsClicking] = useState(false);

            useEffect(() => {
                if(!enabled)return;
                const onMouseDown = () => setIsClicking(true);
                const onMouseUp = () => setIsClicking(false);
                const onMouseOver = (e) => {
                    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' ||
                        e.target.closest('button') || e.target.closest('a') ||
                        e.target.closest('.cursor-pointer') || e.target.tagName === 'INPUT') {
                        setIsHovering(true);
                    } else {
                        setIsHovering(false);
                    }
                };

                window.addEventListener('mousedown', onMouseDown);
                window.addEventListener('mouseup', onMouseUp);
                window.addEventListener('mouseover', onMouseOver);

                let animationFrameId;
                const renderLoop = () => {
                    const now = Date.now();
                    if (pointsRef.current.length > 0) {
                        // Trail retains for 500ms
                        pointsRef.current = pointsRef.current.filter(p => now - p.t < 500);
                    }
                    if (pathRef.current) {
                        if (pointsRef.current.length > 1) {
                            const head = pointsRef.current[pointsRef.current.length - 1];
                            let d = `M ${head.x} ${head.y}`;
                            for (let i = pointsRef.current.length - 2; i >= 0; i--) {
                                const p = pointsRef.current[i];
                                d += ` L ${p.x} ${p.y}`;
                            }
                            pathRef.current.setAttribute('d', d);
                        } else {
                            pathRef.current.setAttribute('d', '');
                        }
                    }
                    animationFrameId = requestAnimationFrame(renderLoop);
                };
                animationFrameId = requestAnimationFrame(renderLoop);

                const onMouseMove = (e) => {
                    const { clientX, clientY } = e;
                    if (cursorRef.current) {
                        cursorRef.current.style.opacity = '1';
                        document.documentElement.classList.add('custom-cursor-active');
                        cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
                    }
                    pointsRef.current.push({ x: clientX, y: clientY, t: Date.now() });
                };

                const leave=()=>{if(cursorRef.current)cursorRef.current.style.opacity='0';document.documentElement.classList.remove('custom-cursor-active');pointsRef.current=[];};
                document.addEventListener('mouseleave',leave);
                window.addEventListener('mousemove', onMouseMove);

                return () => {
                    document.removeEventListener('mouseleave',leave);document.documentElement.classList.remove('custom-cursor-active');
                    window.removeEventListener('mousedown', onMouseDown);
                    window.removeEventListener('mouseup', onMouseUp);
                    window.removeEventListener('mouseover', onMouseOver);
                    window.removeEventListener('mousemove', onMouseMove);
                    cancelAnimationFrame(animationFrameId);
                };
            }, [enabled]);

            if(!enabled)return null;
            return (
                <div aria-hidden="true" className="custom-cursor-container pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <path ref={pathRef} fill="none" stroke="#4B9CD3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }} />
                    </svg>
                    <div ref={cursorRef} className="fixed top-0 left-0 pointer-events-none will-change-transform" style={{ left: 0, top: 0, opacity: 0 }}>
                        <div className="w-4 h-4 bg-unc rounded-full mix-blend-difference" style={{ transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : (isHovering ? 2.0 : 1)})`, transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.13, 1.5)' }} />
                    </div>
                </div>
            );
        };

        // --- UTILITIES ---
        const ScrollProgress = () => {
            const { scrollYProgress } = useScroll();
            const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
            return <motion.div className="fixed top-0 left-0 right-0 h-1 bg-unc origin-left z-[60]" style={{ scaleX }} />;
        };

        const Toast = ({ message, isVisible, onClose }) => (
            <AnimatePresence>
                {isVisible && (
                    <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }} className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[110] bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
                        <i data-lucide="check-circle" className="w-5 h-5 text-green-500"></i><span className="font-medium text-sm">{message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        );

        // --- PERFORMANCE UTILITIES ---
        // Hook to load scripts dynamically
        const useScript = (src) => {
            const [status, setStatus] = useState(src ? "loading" : "idle");
            useEffect(() => {
                if (!src) { setStatus("idle"); return; }
                let script = document.querySelector(`script[src="${src}"]`);
                if (!script) {
                    script = document.createElement("script");
                    script.src = src;
                    script.async = true;
                    script.setAttribute("data-status", "loading");
                    document.body.appendChild(script);
                    const setAttributeFromEvent = (event) => {
                        script.setAttribute("data-status", event.type === "load" ? "ready" : "error");
                        setStatus(event.type === "load" ? "ready" : "error");
                    };
                    script.addEventListener("load", setAttributeFromEvent);
                    script.addEventListener("error", setAttributeFromEvent);
                    return () => {
                        script.removeEventListener("load", setAttributeFromEvent);
                        script.removeEventListener("error", setAttributeFromEvent);
                    };
                } else {
                    setStatus(script.getAttribute("data-status"));
                }
                const setStateFromEvent = (event) => setStatus(event.type === "load" ? "ready" : "error");
                script.addEventListener("load", setStateFromEvent);
                script.addEventListener("error", setStateFromEvent);
                return () => {
                    if (script) {
                        script.removeEventListener("load", setStateFromEvent);
                        script.removeEventListener("error", setStateFromEvent);
                    }
                };
            }, [src]);
            return status;
        };

        // Render Lucide icons after both React and the CDN script are ready.
        // The CDN can finish loading after the first React paint, so a single
        // initialization attempt makes icons appear only after a later re-render.
        const useLucideIcons = (activeSection, darkMode, searchOpen, toastVisible) => {
            useEffect(() => {
                let cancelled = false;
                let retryId;
                let renderId;
                let attempts = 0;
                const lucideScript = document.querySelector('script[src*="lucide"]');
                const renderIcons = () => {
                    if (cancelled) return;
                    if (window.lucide?.createIcons) {
                        window.lucide.createIcons();
                        return;
                    }
                    if (attempts < 100) {
                        attempts += 1;
                        retryId = window.setTimeout(renderIcons, 50);
                    }
                };
                const scheduleRender = () => {
                    window.clearTimeout(renderId);
                    renderId = window.setTimeout(renderIcons, 0);
                };
                const observer = new MutationObserver(() => {
                    if (document.querySelector('i[data-lucide]')) scheduleRender();
                });
                observer.observe(document.body, { childList: true, subtree: true });
                scheduleRender();
                lucideScript?.addEventListener('load', renderIcons);
                return () => {
                    cancelled = true;
                    window.clearTimeout(retryId);
                    window.clearTimeout(renderId);
                    observer.disconnect();
                    lucideScript?.removeEventListener('load', renderIcons);
                };
            }, [activeSection, darkMode, searchOpen, toastVisible]);
        };

        // Component to defer rendering until visible or after initial load
        const DeferredSection = ({ children }) => {
            const [shouldRender, setShouldRender] = useState(false);
            const ref = useRef(null);

            useEffect(() => {
                // Simple timeout to defer non-critical sections slightly
                const timer = setTimeout(() => setShouldRender(true), 100);
                return () => clearTimeout(timer);
            }, []);

            if (!shouldRender) return <div ref={ref} className="min-h-[200px]" />; // Placeholder
            return <>{children}</>;
        };

        // --- ANIMATION VARIANTS ---
        const pageVariants = {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -10 },
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
        };

        // --- DATA ---
        const NAV_ITEMS = [{ id: 'home', label: 'Overview' }, { id: 'now', label: 'Now' }, { id: 'news', label: 'News' }, { id: 'research', label: 'Research' }, { id: 'projects', label: 'Artifacts' }, { id: 'unc', label: 'Campus' }, { id: 'art', label: 'Gallery' }, { id: 'contact', label: 'Contact' }];
        const NEWS_DATA = [{"date": "October 2026", "title": "Measurement auditing & output-specific processing", "subtitle": "MOTION_AUDIT \u00b7 Manuscript in preparation", "desc": "Connected measurement-chain analysis with controlled equipment effects and independent synthetic-body tests of angle and repetition processing.", "id": "news-motion"}, {"date": "2026", "title": "CUSP accepted", "subtitle": "iAIM 2026", "desc": "Presenting the integrated health-information project linking longitudinal personal context with interpretable measurements and care workflows.", "id": "news-cusp-iaim"}, {"date": "2026", "title": "C3B poster accepted", "subtitle": "iAIM 2026", "desc": "Presenting concept-decomposable modeling of irregular clinical time series.", "id": "news-iaim"}, {"date": "2026", "title": "Two measurement-audit manuscripts submitted", "subtitle": "AISTATS 2027 \u00b7 IEEE ICHI 2027", "desc": "Reference audits for model comparison and measurement validity in EHR concept interventions.", "id": "news-manuscripts"}, {"date": "2026", "title": "Reference audits & interpretable health AI", "subtitle": "Current research", "desc": "Studying how reference choices, incomplete observations, and concept definitions affect conclusions in health-AI evaluation.", "id": "news-research"}, {"date": "2026", "title": "Building CUSP", "subtitle": "Research & design prototype", "desc": "Connecting personal context, follow-up questions, and professional review through source-aware, editable workflows.", "id": "news-cusp"}, {"date": "2026", "title": "MSc in Artificial Intelligence in Medicine", "subtitle": "NTU LKCMedicine", "desc": "Continuing from Information Science at UNC Chapel Hill to health-AI research and human-centered systems in Singapore.", "id": "news-ntu"}, {"date": "May 2025", "title": "Selected Exhibitor", "subtitle": "UNC Smart Design Showcase", "desc": "Presented the Chill by U laptop-stand prototype.", "id": "news-01"}, {"date": "2024", "title": "2nd Most Creative Prize", "subtitle": "UNC MakerFest", "desc": "Recognized for the Chill by U design.", "id": "news-03"}, {"date": "2022", "title": "3rd Campus Topic Prize", "subtitle": "Let\u2019s Charrette", "desc": "Sustainable campus design competition.", "id": "news-04"}];
        const WORKS_DATA = [
            {id:'PRJ-10',title:'CUSP',cat:'Health AI & Care Workflows',filterType:'SOFTWARE',status:'iAIM 2026 Accepted',year:'2026',desc:'An integrated-care design connecting personal context, follow-up questions, and professional review. Current work centers on source-aware, editable information workflows.',tech:['Agent workflows','Health AI','Interaction design'],role:'Research & Systems Design',link:'CUSP/',img:'CUSP/assets/app-basic.png'},
            { id: 'PRJ-01', title: 'Offline Oracle', cat: 'HCI & Health Intervention', filterType: 'HARDWARE', status: 'Proto v2.0', year: '2025', desc: 'A hybrid physical-digital framework addressing digital addiction via tangible rewards.', tech: ['Arduino IoT', 'React Native', '3D Printing'], role: 'Lead Researcher', link: null, img: 'Offline_Oracle.png' },
            { id: 'PRJ-02', title: 'TEMPEST Autonomous Vessel', cat: 'Robotics & Perception', filterType: 'HARDWARE', status: 'Field Tested', year: '2023', desc: 'Low-cost autonomous surface vessel (ASV) for urban waterway monitoring.', tech: ['ROS / Python', 'Lidar Sensing', 'Motor Control'], role: 'System Architect', link: null, img: 'TEMPEST_Robot.png' },
            { id: 'PRJ-03', title: 'SmartCan Intelligent Sorting', cat: 'Behavioral Design', filterType: 'SOFTWARE', status: 'Prototype', year: '2024', desc: 'Computer-vision assisted waste disposal system with real-time object recognition.', tech: ['TensorFlow', 'Embedded C++', 'Servo Mechanics'], role: 'Interaction Designer', link: null, img: 'SmartCan.png' },
            { id: 'PRJ-04', title: 'Chill by "U"', cat: 'Fabrication & Thermal Eng', filterType: 'HARDWARE', status: 'Awarded', year: '2024', desc: 'Modular laptop cooling infrastructure with adaptive airflow.', tech: ['Laser Cutting', 'Fusion 360'], role: 'Solo Inventor', link: null, img: 'Chill_by_U.png' },
            { id: 'PRJ-05', title: 'Ecological IoT Feeder', cat: 'Ecological Sensing', filterType: 'HARDWARE', status: 'Operational', year: '2023', desc: 'Automated avian monitoring system using weight/light sensors.', tech: ['IoT Sensors', 'Data Logging'], role: 'Hardware Eng', link: null, img: 'Smart_Bird_Feeder.png' },
            { id: 'PRJ-06', title: 'Spatial Inequality Analysis', cat: 'Data Science (GIS)', filterType: 'DATA_SCI', status: 'Research Project', year: '2022', desc: 'Quantitative geospatial analysis of US Population Change & Global Coffee Trade.', tech: ['R / RStudio', 'ArcGIS Pro'], role: 'Data Analyst', link: null, img: 'GIS_Map.png' },
            { id: 'PRJ-07', title: 'Pluggy Ecosystem', cat: 'Hardware & Business', filterType: 'HARDWARE', status: 'Proposal', year: '2025', desc: 'A tangible charging concept that uses gamification to support digital wellbeing.', tech: ['GaN Hardware', 'IoT', 'Gamification'], role: 'Co-Founder', link: 'Pluggy.html', img: 'Pluggy.png' },
            { id: 'PRJ-08', title: 'Agri-Drone HMI', cat: 'HMI & Systems Design', filterType: 'UI_DESIGN', status: 'Concept v3', year: '2025', desc: 'HMI for managing autonomous agricultural drone swarms with gaze-tracking.', tech: ['Adobe XD', 'WebGazer API'], role: 'UX Researcher', link: null, img: null },
            { id: 'PRJ-09', title: 'Health Dashboard', cat: 'UI/UX & MedTech', filterType: 'UI_DESIGN', status: 'Ongoing', year: '2025', desc: 'Health Informatics APP for remote patient monitoring.', tech: ['Figma', 'Health Informatics'], role: 'UX Designer', link: null, img: 'Health_Informatics.png' },
            { id: 'PRJ-10', title: 'CUSP Health Ecosystem', cat: 'Health AI & Product Design', filterType: 'DATA_SCI', status: 'Prototype', year: '2026', desc: 'A personal health intelligence concept linking wearable, lifestyle and glucose context across time.', tech: ['Python', 'Wearables', 'Figma'], role: 'CUSP Project', link: 'CUSP/', img: 'CUSP/assets/hero.jpg' }
        ];
        const RESEARCH_DATA = [{"id":"motion","title":"MOTION_AUDIT","area":"Vision-based motion measurement","question":"What can a correct final number hide?","desc":"I compare the world reference, its image projection, and predicted keypoints under the same counting or angle rule. This makes projection failures and hidden intermediate discrepancies visible.","finding":"Controlled equipment renderings reveal task-dependent effects. Separate processing objectives for angles and counts improve complete measurement success on 12 new synthetic bodies.","status":"Manuscript in preparation","tags":["Computer vision","Measurement audit","Temporal operators"]},{"id":"reference","title":"Finite-Population Reference Audits for Model Comparison","area":"Statistical evaluation","question":"Does the comparison survive a change of reference?","desc":"A finite-population audit checks model-comparison stability when only part of a second reference can be inspected and some answers remain unavailable.","finding":"The audit covers all legal comparison outcomes. In the constructed-margin study, it improves correct determinations by 27.34 percentage points over the tested direct empirical-Bernstein adaptation at 30% disclosure.","status":"Submitted to AISTATS 2027","tags":["Finite-population inference","Partial identification","Reference uncertainty"],"shortTitle":"Reference audits"},{"id":"concept-audit","title":"From Recorded Corrections to Oracle Claims","shortTitle":"Concept intervention audits","area":"EHR concept measurement","question":"What does a recorded correction actually establish?","desc":"I distinguish a model’s response to a recorded clinical reference from the effect of replacing a concept with study-defined truth.","finding":"The work formalizes this identification gap and constructs finite-sample certificates using independent error calibration and signed worst-case loss allocation.","status":"Submitted to IEEE ICHI 2027","tags":["Concept interventions","Measurement validity","Finite-sample certificates"]},{"id":"c3b","title":"C3B · Longitudinal concepts","area":"Interpretable clinical time series","question":"What do the concepts measure over time?","desc":"C3B studies irregular clinical time series through a risk logit that decomposes exactly into eight named clinical concept contributions.","finding":"The work connects longitudinal modeling with source-traced evaluation, separating concept measurement, risk prediction, and concept correction.","status":"iAIM 2026 · Poster accepted","tags":["Concept bottlenecks","Longitudinal data","Interpretable AI"]},{"id":"ecg","title":"ECG concept measurement","area":"Source-aware calibration","question":"How does the reference procedure change a concept?","desc":"This work examines interpretable ECG measurements across reference procedures and calibration choices.","finding":"A completed course research study investigates source-specific readouts and the distinction between reproducing a measurement and establishing a clinical reference.","status":"Course research project","tags":["ECG","Calibration","Measurement validity"]}];
        const ART_DATA = [{"id": "art-01", "title": "Altered Landscape", "medium": "Digital Photography, 2024", "img": "Altered_Landscape_I.jpg", "aspect": "aspect-[3/2]", "colSpan": "md:col-span-8"}, {"id": "art-02", "title": "Layered Transparency", "medium": "Graphite on Paper", "img": "Layered_Transparency.png", "aspect": "aspect-[3/4]", "colSpan": "md:col-span-4"}, {"id": "art-03", "title": "Structure 8", "medium": "Charcoal Study", "img": "Structure_8.png", "aspect": "aspect-square", "colSpan": "md:col-span-4"}, {"id": "art-05", "title": "Cultural Stitch", "medium": "Graphite on Paper", "img": "Cultural Stitch.png", "aspect": "aspect-[3/4]", "colSpan": "md:col-span-8"}];

        // --- COMPONENTS ---

        // 1. Search Modal
        const SearchModal = ({ isOpen, onClose, sections, activeSection, setActiveSection }) => {
            const [query, setQuery] = useState('');
            const inputRef = useRef(null);

            useEffect(() => {
                if (!isOpen) return; const previous=document.activeElement; const timer=setTimeout(()=>inputRef.current?.focus(),0); const trap=e=>{const box=document.querySelector('[role=dialog]');if(e.key==='Escape'){e.preventDefault();onClose();}if(e.key==='Tab'&&box){const nodes=[...box.querySelectorAll('button,input,a[href]')];const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};document.addEventListener('keydown',trap);return()=>{clearTimeout(timer);document.removeEventListener('keydown',trap);previous?.focus();};
            }, [isOpen]);

            const filteredItems = useMemo(() => {
                if (!query) return [];
                const lowerQ = query.toLowerCase();
                const results = [];
                sections.forEach(sec => { if (sec.label.toLowerCase().includes(lowerQ)) results.push({ type: 'Navigate', label: sec.label, id: sec.id, icon: 'map-pin' }); });
                RESEARCH_DATA.forEach(work => { if ((work.title+' '+work.desc+' '+work.tags.join(' ')).toLowerCase().includes(lowerQ)) results.push({type:'Research',label:work.title,id:'research',sub:work.area,icon:'book-open'}); });
                WORKS_DATA.forEach(work => { if (work.title.toLowerCase().includes(lowerQ) || work.desc.toLowerCase().includes(lowerQ)) results.push({ type: 'Project', label: work.title, id: 'projects', sub: work.cat, icon: 'folder' }); });
                return results;
            }, [query, sections]);

            if (!isOpen) return null;

            return (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
                    <div className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
                    <motion.div role="dialog" aria-modal="true" aria-label="Search portfolio"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[60vh]"
                    >
                        <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <i data-lucide="search" className="w-5 h-5 text-gray-400"></i>
                            <input
                                ref={inputRef}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 ml-3 text-base outline-none"
                                aria-label="Search projects and research" placeholder="Search projects, research, or navigate..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
                            />
                            <button onClick={onClose} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-1 rounded cursor-pointer">ESC</button>
                        </div>
                        <div className="overflow-y-auto p-2">
                            {filteredItems.length === 0 && query !== '' && (
                                <div className="p-4 text-center text-sm text-gray-500">No results found.</div>
                            )}
                            {filteredItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setActiveSection(item.id); onClose(); }}
                                    className="w-full text-left flex items-center gap-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group transition-colors cursor-pointer"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 group-hover:bg-unc group-hover:text-white transition-colors">
                                        <i data-lucide={item.icon || 'arrow-right'} className="w-4 h-4"></i>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</div>
                                        {item.sub && <div className="text-xs text-gray-500 dark:text-gray-400">{item.type} • {item.sub}</div>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            );
        };

        const Navbar = ({ activeSection, setActiveSection, darkMode, toggleTheme, setSearchOpen }) => {
            const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
            useEffect(()=>{const close=e=>{if(e.key==='Escape')setMobileMenuOpen(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[]);
            return (
                <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
                    <ScrollProgress />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center h-16 sm:h-20 gap-2 lg:gap-4">
                            <button type="button" aria-label="Go to overview" className="flex flex-col items-start shrink-0 group text-left" onClick={()=>setActiveSection('home')}><span className="text-base sm:text-lg font-serif font-bold text-gray-900 dark:text-white group-hover:text-unc">Yihan Zhang</span><span className="text-[9px] tracking-wide uppercase text-unc-dark dark:text-unc-light">NTU LKCMedicine · UNC Chapel Hill</span></button>
                            <div className="hidden xl:flex min-w-0 flex-1 justify-center gap-3 lg:gap-4 xl:gap-5 text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">{NAV_ITEMS.map((item) => (<button key={item.id} onClick={() => setActiveSection(item.id)} className={`nav-btn whitespace-nowrap transition-colors hover:text-black dark:hover:text-white relative cursor-pointer ${activeSection === item.id ? 'text-black dark:text-white font-semibold' : ''}`}>{item.label}{activeSection === item.id && <motion.div layoutId="underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-unc" />}</button>))}</div>
                            <div className="hidden xl:flex shrink-0 items-center gap-2 lg:gap-3">
                                <button type="button" aria-label="Search portfolio" onClick={() => setSearchOpen(true)} className="group relative flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600 w-36 lg:w-40 xl:w-48">
                                    <i data-lucide="search" className="w-4 h-4 text-gray-500 dark:text-gray-400"></i>
                                    <span className="hidden lg:inline text-sm text-gray-400 dark:text-gray-500 font-normal">Search...</span>
                                    <div className="absolute right-2 hidden xl:flex items-center gap-1"><span className="text-[10px] font-mono text-gray-400 border border-gray-300 dark:border-gray-600 rounded px-1">⌘K</span></div>
                                </button>
                                <button type="button" aria-label={darkMode ? "Use light theme" : "Use dark theme"} onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer"><i data-lucide={darkMode ? "sun" : "moon"} className="w-4 h-4"></i></button><div className="hidden lg:block h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div><button type="button" onClick={() => setActiveSection('cv')} className="cursor-pointer flex items-center gap-1.5 text-xs font-medium text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-3 lg:px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-unc/30 transition shadow-sm"><i data-lucide="file-text" className="w-3 h-3"></i> CV</button>
                            </div>
                            <div className="ml-auto flex xl:hidden shrink-0 items-center gap-1 sm:gap-3"><button type="button" aria-label={darkMode ? "Use light theme" : "Use dark theme"} onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-300 cursor-pointer"><i data-lucide={darkMode ? "sun" : "moon"} className="w-5 h-5"></i></button><button type="button" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen} className="p-2 text-gray-600 dark:text-gray-300 cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><i data-lucide={mobileMenuOpen ? "x" : "menu"} className="w-6 h-6"></i></button></div>
                        </div>
                    </div>
                    <AnimatePresence>{mobileMenuOpen && (<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-16 sm:top-20 left-0 right-0 z-40 pt-6 pb-8 px-6 mobile-menu-backdrop dark:bg-gray-900 xl:hidden flex flex-col max-h-[calc(100dvh-5rem)] overflow-y-auto"><div className="flex flex-col gap-4 text-center">{NAV_ITEMS.map((item) => (<button key={item.id} onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }} className={`text-2xl font-serif cursor-pointer ${activeSection === item.id ? 'text-unc font-bold' : 'text-gray-800 dark:text-gray-200'}`}>{item.label}</button>))}<button onClick={()=>{setActiveSection('cv');setMobileMenuOpen(false);}} className="text-2xl font-serif">CV</button><button onClick={()=>{setSearchOpen(true);setMobileMenuOpen(false);}} className="text-lg">Search</button></div></motion.div>)}</AnimatePresence>
                </nav>
            );
        };

        const Hero = ({ setActiveSection }) => (
            <section className="pt-32 pb-16 md:pt-44 md:pb-24 bg-white dark:bg-[#050b16]">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-10 md:gap-16 items-center">
                    <div className="md:col-span-8">
                        <p className="brief-label mb-6">Yihan Zhang / NTU LKCMedicine · UNC Chapel Hill</p>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl tracking-tight font-medium leading-[1.08] mb-7 text-gray-900 dark:text-white">Understanding what<br /><span className="text-unc-dark dark:text-unc-light">health AI measures.</span></h1>
                        <p className="text-lg md:text-xl leading-relaxed text-gray-600 dark:text-gray-300 max-w-2xl mb-5">I’m an MSc student in <strong className="font-medium text-gray-900 dark:text-white">Artificial Intelligence in Medicine</strong> at NTU LKCMedicine, with a background in Information Science, art, and geography at UNC Chapel Hill.</p>
                        <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400 max-w-2xl mb-8">My work asks how we can make health-AI outputs meaningful and useful: trace what was measured, understand the reference, and design workflows people can review and correct.</p>
                        <div className="flex flex-wrap gap-3"><button onClick={()=>setActiveSection('research')} className="px-5 py-3 rounded-full bg-unc-dark dark:bg-unc-light text-white dark:text-gray-950 font-medium text-sm">Explore current research <span aria-hidden="true">↗</span></button><a href="profile/Yihan_Zhang_CV.pdf?v=20261020-cusp" target="_blank" rel="noopener noreferrer" className="px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium">Read my CV</a></div>
                        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Based in Singapore · Health AI, measurement, and human-centered systems</p>
                    </div>
                    <figure className="md:col-span-4 max-w-xs mx-auto md:ml-auto w-full"><img src="profile/portrait.png" alt="Yihan Zhang" width="1150" height="1368" fetchPriority="high" className="w-full aspect-[4/5] object-cover rounded-2xl border border-gray-200 dark:border-gray-700"/><figcaption className="mt-4 text-sm text-gray-500 dark:text-gray-400">From building tangible systems<br/>to asking what their outputs mean.</figcaption></figure>
                </div>
            </section>
        );
        const ResearchBrief = ({setActiveSection}) => (
            <section className="border-y border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-12 md:py-16"><div className="max-w-6xl mx-auto px-6">
                <div className="grid md:grid-cols-12 gap-6 mb-8"><p className="brief-label md:col-span-3">The brief / Current focus</p><div className="md:col-span-9"><h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-4">Better measurements. More useful decisions.</h2><p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">A model can return the right number for the wrong reasons. I investigate that gap in motion analysis, reference-based evaluation, and health concepts—and connect these questions to CUSP, a prototype for reviewable care workflows.</p></div></div>
                <div className="grid md:grid-cols-2 gap-x-12">{RESEARCH_DATA.slice(0,4).map((work,i)=><button key={work.id} onClick={()=>setActiveSection('research')} className="research-row text-left py-5 flex gap-4 group"><span className="text-xs font-mono text-gray-400 mt-1">0{i+1}</span><span><span className="block text-lg font-medium group-hover:text-unc">{work.shortTitle || work.title} <span aria-hidden="true">↗</span></span><span className="block mt-1 text-sm text-gray-600 dark:text-gray-400">{work.question}</span></span></button>)}</div>
                <div className="mt-7 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center justify-between"><p className="text-sm text-gray-600 dark:text-gray-400">CUSP puts this research in context: personal insight, questions, and care handoffs.</p><a href="CUSP/" className="text-sm font-medium text-unc-dark dark:text-unc-light">Explore the CUSP prototype ↗</a></div>
            </div></section>
        );


        const Stats = () => (<section className="py-10 border-t border-gray-200 dark:border-gray-800"><div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-3 gap-6 text-sm"><p><strong className="block mb-1">NTU LKCMedicine</strong><span className="text-gray-500 dark:text-gray-400">MSc · AI in Medicine</span></p><p><strong className="block mb-1">UNC Chapel Hill</strong><span className="text-gray-500 dark:text-gray-400">BS · Information Science</span></p><p><strong className="block mb-1">Research × making</strong><span className="text-gray-500 dark:text-gray-400">Measurement, software, hardware, and design</span></p></div></section>);

        const NowPage = () => (<section className="page-atlas py-32 min-h-screen"><div className="max-w-4xl mx-auto px-6"><p className="brief-label mb-4">Now / October 2026</p><h1 className="text-4xl md:text-6xl tracking-tight font-medium mb-10">What I’m working on.</h1>{[
 ['Health-AI measurement','Developing research on motion measurement chains, reference uncertainty, longitudinal concepts, and ECG calibration. The shared question is how the meaning of a reference shapes what an AI result can tell us.'],
 ['CUSP: research into workflows','Building a prototype that connects personal context, follow-up questions, and professional review. I’m especially interested in source tracking, uncertainty, editable drafts, and how corrections propagate.'],
 ['From research to collaboration','Continuing my MSc at NTU LKCMedicine and developing a research direction across trustworthy health AI and human-centered systems. I welcome conversations with researchers working on evaluation, interpretable models, sensing, and care workflows.']
 ].map(([title,desc])=><article key={title} className="research-row py-8"><h2 className="text-2xl mb-3 font-medium">{title}</h2><p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">{desc}</p></article>)}<a href="mailto:yihan012@e.ntu.edu.sg" className="inline-block mt-6 text-unc-dark dark:text-unc-light font-medium">Start a conversation ↗</a></div></section>);

        const NewsSection = () => (
            <section className="page-atlas py-16 md:py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-baseline gap-4 mb-8 md:mb-12"><h2 className="text-xl md:text-2xl font-serif font-bold text-black dark:text-white">Selected Highlights</h2><div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div></div>
                    <div className="space-y-8 md:space-y-12 border-l border-gray-200 dark:border-gray-700 pl-6 md:pl-8 ml-2 md:ml-3">
                        {NEWS_DATA.map((item, i) => (
                            <div key={i} className="relative group">
                                <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 md:w-5 md:h-5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full group-hover:border-unc group-hover:scale-110 transition-all duration-300"></div>
                                <span className="text-[10px] md:text-xs font-mono text-unc mb-1 block uppercase tracking-wider font-bold">{item.date}</span>
                                <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-gray-100">{item.title} <span className="text-gray-400 dark:text-gray-500 font-light block md:inline">| {item.subtitle}</span></h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );

        const Research = () => (<section className="page-atlas pt-32 pb-20"><div className="max-w-6xl mx-auto px-6"><p className="brief-label mb-4">Research / Selected ongoing work</p><h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6">From measurements<br/>to decisions people can trust.</h1><p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 max-w-3xl mb-14">I study how references, observation conditions, and processing choices shape health-AI outputs. My work combines statistical evaluation, controlled visual experiments, interpretable modeling, and human-centered system design.</p>
                {RESEARCH_DATA.map((work,i)=><article id={work.id} key={work.id} className="research-row py-10 grid md:grid-cols-12 gap-5 md:gap-10"><div className="md:col-span-4"><p className="brief-label mb-3">0{i+1} / {work.area}</p><h2 className="text-2xl md:text-3xl tracking-tight font-medium mb-4">{work.title}</h2><span className="text-xs text-gray-500 dark:text-gray-400">{work.status} · 2026</span></div><div className="md:col-span-8"><h3 className="text-xl font-medium mb-3">{work.question}</h3><p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{work.desc}</p><p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5">{work.finding}</p><div className="flex flex-wrap gap-2">{work.tags.map(t=><span key={t} className="text-xs px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-full text-gray-500 dark:text-gray-400">{t}</span>)}</div></div></article>)}
                <article className="research-row py-10 grid md:grid-cols-12 gap-8"><div className="md:col-span-4"><p className="brief-label mb-3">Systems / Research prototype · Accepted at iAIM 2026</p><h2 className="text-3xl font-medium">CUSP</h2></div><div className="md:col-span-8"><h3 className="text-xl font-medium mb-3">Make health information reviewable and actionable.</h3><p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">CUSP connects personal insight, questions, and professional review. The research prototypes explore how to preserve provenance, permissions, uncertainty, and correction history as information moves through a care workflow.</p><a href="CUSP/" className="text-unc-dark dark:text-unc-light font-medium">View CUSP’s product and research context ↗</a></div></article>
                <div className="research-row py-10 grid md:grid-cols-2 gap-12"><div><h2 className="text-xl font-medium mb-5">Earlier work & design</h2><a href="07_Offline Oracle_ A Gamified Framework.pdf" target="_blank" rel="noopener noreferrer" className="block text-unc-dark dark:text-unc-light mb-2">Offline Oracle · Draft framework, 2025 ↗</a><p className="text-sm text-gray-600 dark:text-gray-400 mb-5">A tangible, gamified approach to digital wellbeing.</p><a href="03_Research-portfolio_Yihan.pdf" target="_blank" rel="noopener noreferrer" className="text-unc-dark dark:text-unc-light">Earlier research & design portfolio ↗</a><p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Including geospatial analysis and physical prototypes.</p></div><div><h2 className="text-xl font-medium mb-5">Industrial invention</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 mb-4">My hardware background includes environmental-engineering R&D and two granted Chinese utility-model patents.</p><a className="block text-sm text-unc-dark dark:text-unc-light mb-3" href="https://patents.google.com/patent/CN209791046U/en" target="_blank" rel="noopener noreferrer">CN209791046U · Disc-tube reverse osmosis apparatus ↗</a><a className="block text-sm text-unc-dark dark:text-unc-light" href="https://patents.google.com/patent/CN215209304U/en" target="_blank" rel="noopener noreferrer">CN215209304U · Kitchen-waste extraction device ↗</a></div></div>
            </div></section>);


        const Projects = () => {
            const [activeFilter, setActiveFilter] = useState('ALL');
            const filteredWorks = useMemo(() => { if (activeFilter === 'ALL') return WORKS_DATA; return WORKS_DATA.filter(work => work.filterType === activeFilter); }, [activeFilter]);

            return (
                <section className="page-atlas py-24 bg-white dark:bg-gray-900 relative border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-2 border-black dark:border-white pb-6">
                            <div>
                                <div className="flex items-center gap-2 text-black dark:text-white font-serif italic text-sm mb-2">
                                    <span className="w-2 h-2 bg-black dark:bg-white rounded-full"></span>
                                    Selected Works
                                </div>
                                <h2 className="text-4xl md:text-6xl font-serif font-bold text-black dark:text-white tracking-tight">
                                    Artifacts <span className="text-gray-400 font-light">&</span> Data
                                </h2>
                            </div>
                            <div className="mt-6 md:mt-0 text-right font-mono text-xs space-y-1 text-gray-600 dark:text-gray-400">
                                <p>Research, software & physical prototypes</p>
                                <p>STATUS: <span className="text-green-600 dark:text-green-400 font-bold">ONLINE</span></p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-12 pb-6 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">
                            {[
                                { id: 'ALL', label: 'All work' },
                                { id: 'HARDWARE', label: 'Hardware' },
                                { id: 'SOFTWARE', label: 'Software' },
                                { id: 'UI_DESIGN', label: 'Interfaces' },
                                { id: 'DATA_SCI', label: 'Data analysis' }
                            ].map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={`px-4 py-2 border transition-all duration-300 uppercase tracking-wider cursor-pointer ${activeFilter === filter.id
                                        ? 'bg-black text-white border-black shadow-lg dark:bg-white dark:text-black dark:border-white'
                                        : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700 dark:hover:border-white dark:hover:text-white'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        <React.Fragment>
                            <motion.div
                                key={activeFilter}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="grid md:grid-cols-2 gap-8 md:gap-12"
                            >
                                {filteredWorks.map((work) => (
                                    <motion.div
                                        key={work.id}
                                        className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-500 flex flex-col h-full shadow-sm hover:shadow-2xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-black dark:border-t-white border-l-[40px] border-l-transparent z-20"></div>
                                        <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-5 py-3 flex justify-between items-center font-mono text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            <span className="font-bold text-black dark:text-white">REF: {work.id}</span>
                                            <div className="flex gap-4 items-center">
                                                <span>{work.year}</span>
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${work.status.includes('Awarded') ? 'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white'}`}>
                                                    {work.status}
                                                </span>
                                            </div>
                                        </div>

                                        <a href={work.link || undefined} target={work.link ? "_blank" : undefined} rel={work.link ? "noopener noreferrer" : undefined} aria-disabled={!work.link} className={`block relative aspect-[16/10] overflow-hidden border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 group-hover:opacity-100 ${work.link ? 'cursor-pointer' : 'cursor-default'}`}>
                                            {work.img ? <img
                                                src={work.img}
                                                alt={work.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700 ease-in-out group-hover:scale-105"
                                                onError={(e)=>{e.currentTarget.style.visibility='hidden';}}
                                            /> : <div className="h-full grid place-content-center text-center px-8"><span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest">Interaction design study</span><span className="text-2xl font-medium mt-3">{work.title}</span></div>}
                                            
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur text-white px-6 py-3 text-xs font-mono uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center">
                                                <span>{work.link ? 'Access Full Documentation' : 'Case Study In Preparation'}</span>
                                                <i data-lucide="arrow-right" className="w-3 h-3"></i>
                                            </div>
                                        </a>

                                        <div className="p-8 flex-grow flex flex-col relative">
                                            <div className="absolute top-4 right-4 text-6xl font-bold text-gray-100 dark:text-gray-800 font-serif pointer-events-none -z-0 select-none">
                                                {work.id.split('-')[1]}
                                            </div>
                                            <div className="mb-6 relative z-10">
                                                <span className="text-[10px] font-bold bg-black dark:bg-white text-white dark:text-black px-2 py-1 inline-block mb-3 font-mono uppercase tracking-widest">{work.cat}</span>
                                                <h3 className="text-3xl font-serif font-bold text-black dark:text-white leading-none group-hover:text-unc transition-colors mt-1">
                                                    {work.title}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-serif leading-relaxed mb-8 flex-grow relative z-10">
                                                {work.desc}
                                            </p>
                                            <div className="mt-auto border-t-2 border-gray-100 dark:border-gray-800 pt-4 relative z-10">
                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div className="col-span-3">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Technology Stack</span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {work.tech.map((t, i) => (
                                                                <span key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[9px] font-mono text-gray-700 dark:text-gray-300">
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-end border-t border-gray-100 dark:border-gray-800 pt-2">
                                                    <div>
                                                        <span className="text-[9px] font-mono text-gray-400 uppercase block">Primary Role</span>
                                                        <span className="text-xs font-bold text-black dark:text-white">{work.role}</span>
                                                    </div>
                                                    <i data-lucide="file-check" className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white transition-colors"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </React.Fragment>
                    </div>
                </section>
            );
        };

        // ENHANCED MOMA STYLE ART GALLERY (Asymmetrical Grid & Design Refresh)
        const ArtGallery = () => (
            <section className="py-14 md:py-20 bg-black text-white transition-colors duration-300 relative overflow-hidden border-t border-unc/30">
                <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
                    {/* Gallery Header */}
                    <div className="mb-10 md:mb-16 border-t border-white pt-6 flex flex-col md:flex-row justify-between items-start">
                        <div className="md:w-1/3">
                            <h2 className="text-4xl md:text-6xl font-sans font-bold tracking-tighter mb-4">
                                Art & Design<br /><span className="text-moma-red">Gallery</span>
                            </h2>
                        </div>
                        <div className="md:w-1/3">
                            <p className="text-sm md:text-base font-light leading-relaxed text-gray-400">
                                A curated selection of visual works exploring <strong className="text-white">"Altered Landscapes"</strong> and structural transparency.
                                Included in the <span className="text-moma-red font-bold">UNC Studio Art Minor</span> portfolio.
                            </p>
                        </div>
                    </div>

                    {/* MoMA Asymmetrical Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8">
                        {ART_DATA.map((art, i) => (
                            <motion.div
                                key={i}
                                className={`${art.colSpan} flex flex-col gap-3 group`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 0.6, delay: i * 0.05 }}
                            >
                                {/* Artwork Frame */}
                                <div className={`w-full ${art.aspect} bg-[#111] relative overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500`}>
                                    {art.isPlaceholder ? (
                                        <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-gray-500 font-mono text-xs p-8 text-center">
                                            [ Wide Feature: e.g. Landscape_Compilation.jpg ]
                                        </div>
                                    ) : (
                                        <img
                                            src={art.img}
                                            alt={art.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-110"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs font-mono p-4 border border-dashed border-gray-700"><span class="text-2xl mb-2">🖼️</span>${art.img}</div>`;
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Museum Label Style Info */}
                                <div className="flex justify-between items-start border-t border-gray-800 pt-2 mt-1 group-hover:border-moma-red transition-colors duration-300">
                                    <div className="max-w-[80%]">
                                        <h4 className="text-lg font-bold leading-tight group-hover:text-moma-red transition-colors">{art.title}</h4>
                                        <p className="text-xs text-gray-500 font-serif italic mt-0.5">{art.medium}</p>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-gray-500 group-hover:text-moma-red transition-colors">
                                        {(i + 1).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 border-b border-white"></div>
                </div>
            </section>
        );

        const UNCSection = ({ setActiveSection }) => (
            <section className="bg-[#06111f] text-white overflow-hidden">
                <div className="relative min-h-[720px] md:min-h-[780px] flex items-end overflow-hidden border-b border-white/10">
                    <img src="UNC_Landscape.jpg" alt="UNC Chapel Hill campus" loading="eager" className="absolute inset-0 w-full h-full object-cover object-center" onError={(e) => { e.target.style.display = 'none'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06111f] via-[#06111f]/65 to-[#06111f]/35"></div>
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '72px 72px' }}></div>
                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-14 md:pb-20">
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
                            <div className="max-w-4xl">
                                <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold tracking-[0.22em] uppercase text-unc-light mb-7"><span className="w-9 h-px bg-unc-light"></span>Academic Chapter / 2022—2026</div>
                                <div className="flex items-center gap-4 mb-8"><div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/95 border border-white/40 shadow-2xl flex items-center justify-center overflow-hidden"><img src="UNC_Logo.png" alt="UNC logo" loading="lazy" className="w-full h-full object-contain p-2.5" onError={(e) => { e.target.style.display = 'none'; }} /></div><div className="text-xs uppercase tracking-[0.2em] text-white/60 leading-relaxed">Chapel Hill, NC<br /><span className="text-white font-semibold">Carolina Blue</span></div></div>
                                <h2 className="text-[3.6rem] sm:text-7xl md:text-8xl lg:text-9xl font-serif font-bold leading-[0.82] tracking-[-0.065em]">UNC<br /><span className="text-unc-light italic font-normal tracking-[-0.06em]">Chapel Hill</span></h2>
                                <p className="mt-8 text-lg md:text-2xl text-white/75 max-w-2xl font-light leading-relaxed">A formative chapter for building at the intersection of hardware, human behavior, and intelligent systems.</p>
                            </div>
                            <div className="lg:w-72 border-l border-unc-light/60 pl-5 md:pl-6 pb-1"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-unc-light mb-3">Field notes</p><p className="font-serif text-2xl leading-snug">Where making became a method for asking better questions.</p></div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_.85fr] gap-14 lg:gap-24 items-start mb-16 md:mb-20">
                        <div><div className="text-[10px] font-bold uppercase tracking-[0.22em] text-unc-light mb-5">The UNC chapter</div><h3 className="text-4xl md:text-6xl font-serif leading-[1.02] tracking-tight">A campus context for <span className="text-unc-light italic">making</span> ideas tangible.</h3></div>
                        <p className="text-base md:text-lg leading-relaxed text-slate-300 lg:pt-9">At Carolina, Yihan developed a practice that moves between prototyping, interaction design, and behavioral research—using physical systems to make complex ideas visible, testable, and human.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 border-y border-white/10 mb-12 md:mb-16">
                        {[{ value: '4.0', label: 'Recent term GPA' }, { value: '18', label: 'Credit maximum course load' }, { value: 'Top 2', label: 'UNC MakerFest · Creative Prize' }].map((stat, index) => (<div key={stat.label} className={`py-7 md:py-9 ${index < 2 ? 'sm:border-r border-white/10' : ''} ${index ? 'sm:pl-8 lg:pl-10' : ''}`}><div className="text-4xl md:text-5xl font-serif text-white mb-2">{stat.value}</div><div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">{stat.label}</div></div>))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-7 md:p-9 min-h-[280px] transition-all duration-500 hover:-translate-y-1 hover:border-unc-light/60 hover:bg-white/[0.07]"><div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-unc/20 blur-3xl transition-transform duration-500 group-hover:scale-125"></div><div className="relative h-full flex flex-col"><div className="w-11 h-11 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-unc-light mb-10"><i data-lucide="cpu" className="w-5 h-5"></i></div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-unc-light mb-3">01 / Research through making</p><h4 className="text-3xl font-serif mb-4">Systems with a human signal.</h4><p className="text-slate-300 leading-relaxed max-w-md">From behavioral interventions to sensing systems, the work starts with an observable human need and ends in something that can be experienced.</p></div></article>
                        <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-7 md:p-9 min-h-[280px] transition-all duration-500 hover:-translate-y-1 hover:border-unc-light/60 hover:bg-white/[0.07]"><div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-blue-400/10 blur-3xl transition-transform duration-500 group-hover:scale-125"></div><div className="relative h-full flex flex-col"><div className="w-11 h-11 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-unc-light mb-10"><i data-lucide="hammer" className="w-5 h-5"></i></div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-unc-light mb-3">02 / Prototype culture</p><h4 className="text-3xl font-serif mb-4">Ideas earn their shape.</h4><p className="text-slate-300 leading-relaxed max-w-md">A studio mindset—iterating through artifacts, feedback, and technical constraints—anchors an interdisciplinary approach to design engineering.</p></div></article>
                    </div>

                    <div className="mt-5 rounded-2xl border border-unc-light/30 bg-unc/10 p-7 md:p-9 flex flex-col md:flex-row md:items-center md:justify-between gap-7"><div className="flex items-start gap-4"><div className="w-11 h-11 shrink-0 rounded-full bg-unc-light text-[#06111f] flex items-center justify-center"><i data-lucide="heart-pulse" className="w-5 h-5"></i></div><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-unc-light mb-2">The next chapter</p><p className="text-xl md:text-2xl font-serif">Carolina foundations, now extending into Medical AI at NTU LKCMedicine.</p></div></div><button type="button" onClick={() => setActiveSection('projects')} className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-medium hover:bg-white hover:text-[#06111f] transition-colors cursor-pointer">Explore selected work <i data-lucide="arrow-up-right" className="w-4 h-4"></i></button></div>
                </div>
            </section>
        );

        // [Rest of the components: Contact, Footer, ChatWidget, App - UNCHANGED]
        const Contact = () => (<section className="page-atlas pt-36 pb-24 min-h-[80dvh]"><div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12"><div><p className="brief-label mb-4">Contact</p><h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6">Let’s connect.</h1><p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 mb-8">I welcome research collaborations and conversations about trustworthy health AI, measurement, and human-centered systems.</p><a href="mailto:yihan012@e.ntu.edu.sg" className="inline-block text-lg sm:text-xl text-unc-dark dark:text-unc-light break-all">yihan012@e.ntu.edu.sg ↗</a><p className="text-sm text-gray-500 dark:text-gray-400 mt-3">NTU LKCMedicine · Singapore</p></div><div className="research-row py-7 space-y-7"><div><h2 className="font-medium mb-2">Research & technical work</h2><p className="text-gray-600 dark:text-gray-400 leading-relaxed">Measurement audits, interpretable models, sensing, and tools for reviewable health information.</p></div><div><h2 className="font-medium mb-2">Background & experience</h2><a href="profile/Yihan_Zhang_CV.pdf?v=20261020-cusp" target="_blank" rel="noopener noreferrer" className="text-unc-dark dark:text-unc-light">Download current CV ↗</a></div><div><h2 className="font-medium mb-2">GitHub</h2><a href="https://github.com/YihanZhang-UNC" target="_blank" rel="noopener noreferrer" className="text-unc-dark dark:text-unc-light">YihanZhang-UNC ↗</a></div></div></div></section>);

        const Footer = ({activeSection}) => activeSection==='cv' ? null : (<footer className="border-t border-gray-200 dark:border-gray-800 py-10 bg-white dark:bg-gray-900"><div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-5 justify-between text-sm"><div><p className="font-medium mb-1">Yihan Zhang</p><p className="text-gray-500 dark:text-gray-400">Health AI · Measurement · Human-centered systems</p></div><div className="flex flex-wrap gap-5"><a href="mailto:yihan012@e.ntu.edu.sg" className="hover:text-unc">Email</a><a href="profile/Yihan_Zhang_CV.pdf?v=20261020-cusp" className="hover:text-unc">CV</a><a href="https://github.com/YihanZhang-UNC" className="hover:text-unc">GitHub ↗</a><span className="text-gray-500 dark:text-gray-400">Updated October 2026</span></div></div></footer>);

        const ChatWidget = () => {const [isOpen,setIsOpen]=useState(false);return <aside className="hidden md:block fixed bottom-5 right-5 z-40">{isOpen&&<div className="mb-3 w-72 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl"><div className="flex justify-between mb-4"><h2 className="font-medium">Quick guide</h2><button aria-label="Close quick guide" onClick={()=>setIsOpen(false)}>×</button></div><p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Start with Research for my current questions, Artifacts for prototypes, or the CV for education and experience.</p><a href="profile/Yihan_Zhang_CV.pdf?v=20261020-cusp" className="text-sm text-unc-dark dark:text-unc-light">Open current CV ↗</a></div>}<button onClick={()=>setIsOpen(!isOpen)} aria-expanded={isOpen} className="rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 shadow-lg text-sm font-medium">{isOpen?'Close guide':'Quick guide'}</button></aside>;};

        const CVViewer = ({setActiveSection}) => (<div className="fixed inset-0 z-[100] bg-gray-950 text-white flex flex-col"><header className="min-h-16 flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-700"><button aria-label="Back to overview" onClick={()=>setActiveSection('home')} className="text-sm">← Back</button><span className="text-xs sm:text-sm">Yihan Zhang · Research CV</span><a href="profile/Yihan_Zhang_CV.pdf?v=20261020-cusp" download aria-label="Download CV" className="text-sm bg-unc-light text-gray-950 px-4 py-2 rounded-full">Download</a></header><div className="flex-1 relative"><iframe src="profile/Yihan_Zhang_CV.pdf?v=20261020-cusp" className="hidden md:block w-full h-full absolute inset-0" title="Yihan Zhang research CV"/><div className="md:hidden px-8 py-16 text-center"><h1 className="text-2xl mb-4">Research CV</h1><p className="text-gray-300 mb-7">Open the two-page PDF to read education, submitted manuscripts, current research, and experience.</p><a href="profile/Yihan_Zhang_CV.pdf?v=20261020-cusp" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-gray-950 px-6 py-3 rounded-full">Open PDF ↗</a></div></div></div>);

        // --- 3D VISITOR GLOBE COMPONENT ---
        const VisitorGlobe = () => {
            const sectionRef = useRef(null);
            const mountRef = useRef(null);
            const pointsRendererRef = useRef(null);
            const visitorPointsRef = useRef([]);
            const providerRequestRef = useRef(null);
            const [isVisible, setIsVisible] = useState(false);
            const [reloadKey, setReloadKey] = useState(0);
            const [mapStatus, setMapStatus] = useState('idle');
            const [stats, setStats] = useState({ total: null, live: null, top: '—' });
            const threeStatus = useScript(isVisible ? 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js' : null);

            const clearProviderRequest = useCallback(() => {
                const request = providerRequestRef.current;
                if (!request) return;
                window.clearTimeout(request.timeoutId);
                if (request.script.parentNode) request.script.parentNode.removeChild(request.script);
                if (window.addPoints === request.callback) {
                    if (request.previousCallback) window.addPoints = request.previousCallback;
                    else delete window.addPoints;
                }
                providerRequestRef.current = null;
            }, []);

            const loadVisitorData = useCallback(() => {
                clearProviderRequest();
                setMapStatus('loading');

                const previousCallback = window.addPoints;
                const script = document.createElement('script');
                let receivedData = false;
                const callback = (points) => {
                    if (!Array.isArray(points)) {
                        setMapStatus('error');
                        return;
                    }

                    const processed = points
                        .map((point) => ({
                            lat: Number(point?.latLng?.[0]),
                            lng: Number(point?.latLng?.[1]),
                            count: Math.max(1, Number(point?.v) || 1),
                            location: String(point?.name || 'Unknown region')
                        }))
                        .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))
                        .slice(0, 300);

                    if (!processed.length) {
                        setMapStatus('error');
                        return;
                    }

                    receivedData = true;
                    window.clearTimeout(providerRequestRef.current?.timeoutId);
                    visitorPointsRef.current = processed;
                    pointsRendererRef.current?.(processed);
                    const top = processed.reduce((leader, point) => point.count > leader.count ? point : leader, processed[0]);
                    setStats({
                        total: processed.reduce((sum, point) => sum + point.count, 0),
                        live: processed.length,
                        top: top.location
                    });
                    setMapStatus('ready');
                };

                window.addPoints = callback;
                script.async = true;
                script.src = `https://mapmyvisitors.com/globe_call_home.js?d=1KgD_BUlRL7--qUEnYyUv8lwdsd-vt7tOnhdM9S8lkI&w=${Math.max(320, window.innerWidth)}&t=${Date.now()}`;
                script.onerror = () => setMapStatus('error');
                const timeoutId = window.setTimeout(() => {
                    if (!receivedData) setMapStatus('error');
                }, 10000);
                providerRequestRef.current = { script, timeoutId, callback, previousCallback };
                document.body.appendChild(script);
            }, [clearProviderRequest]);

            useEffect(() => {
                const node = sectionRef.current;
                if (!node) return;
                if (!('IntersectionObserver' in window)) {
                    setIsVisible(true);
                    return;
                }
                const observer = new IntersectionObserver(([entry]) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect();
                    }
                }, { rootMargin: '240px 0px' });
                observer.observe(node);
                return () => observer.disconnect();
            }, []);

            useEffect(() => {
                if (isVisible) loadVisitorData();
                return clearProviderRequest;
            }, [isVisible, reloadKey, loadVisitorData, clearProviderRequest]);

            useEffect(() => {
                if (threeStatus !== 'ready' || !mountRef.current) return;

                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
                camera.position.z = 2.9;
                const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
                renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
                renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
                renderer.domElement.setAttribute('aria-hidden', 'true');
                mountRef.current.appendChild(renderer.domElement);

                scene.add(new THREE.AmbientLight(0xffffff, 0.9));
                const keyLight = new THREE.PointLight(0xffffff, 0.6);
                keyLight.position.set(5, 3, 5);
                scene.add(keyLight);

                const globeGeometry = new THREE.SphereGeometry(1, 48, 48);
                const globeMaterial = new THREE.MeshPhongMaterial({ color: 0x5b86a9, shininess: 8 });
                const globe = new THREE.Mesh(globeGeometry, globeMaterial);
                scene.add(globe);

                const textureLoader = new THREE.TextureLoader();
                let earthTexture;
                textureLoader.load(
                    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
                    (texture) => {
                        earthTexture = texture;
                        globeMaterial.map = texture;
                        globeMaterial.needsUpdate = true;
                    }
                );

                const atmosphereGeometry = new THREE.SphereGeometry(1.08, 48, 48);
                const atmosphereMaterial = new THREE.MeshBasicMaterial({ color: 0x4B9CD3, transparent: true, opacity: 0.12, side: THREE.BackSide });
                const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
                scene.add(atmosphere);

                const pointsGroup = new THREE.Group();
                globe.add(pointsGroup);
                const pointGeometry = new THREE.SphereGeometry(0.021, 8, 8);
                const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
                const renderPoints = (points) => {
                    while (pointsGroup.children.length) pointsGroup.remove(pointsGroup.children[0]);
                    points.forEach((point) => {
                        const phi = (90 - point.lat) * (Math.PI / 180);
                        const theta = (point.lng + 180) * (Math.PI / 180);
                        const marker = new THREE.Mesh(pointGeometry, pointMaterial);
                        marker.position.set(
                            -(1.025 * Math.sin(phi) * Math.cos(theta)),
                            1.025 * Math.cos(phi),
                            1.025 * Math.sin(phi) * Math.sin(theta)
                        );
                        pointsGroup.add(marker);
                    });
                };
                pointsRendererRef.current = renderPoints;
                renderPoints(visitorPointsRef.current);

                const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                let dragging = false;
                let previousPointer = null;
                const onPointerDown = (event) => {
                    dragging = true;
                    previousPointer = { x: event.clientX, y: event.clientY };
                    renderer.domElement.setPointerCapture?.(event.pointerId);
                };
                const onPointerMove = (event) => {
                    if (!dragging || !previousPointer) return;
                    globe.rotation.y += (event.clientX - previousPointer.x) * 0.008;
                    globe.rotation.x += (event.clientY - previousPointer.y) * 0.004;
                    previousPointer = { x: event.clientX, y: event.clientY };
                };
                const onPointerUp = () => { dragging = false; previousPointer = null; };
                renderer.domElement.addEventListener('pointerdown', onPointerDown);
                renderer.domElement.addEventListener('pointermove', onPointerMove);
                renderer.domElement.addEventListener('pointerup', onPointerUp);
                renderer.domElement.addEventListener('pointerleave', onPointerUp);

                const onResize = () => {
                    if (!mountRef.current) return;
                    const { clientWidth, clientHeight } = mountRef.current;
                    renderer.setSize(clientWidth, clientHeight);
                    camera.aspect = clientWidth / clientHeight;
                    camera.updateProjectionMatrix();
                };
                window.addEventListener('resize', onResize);

                let animationFrame;
                const animate = () => {
                    animationFrame = requestAnimationFrame(animate);
                    if (!reduceMotion && !dragging) globe.rotation.y += 0.0015;
                    renderer.render(scene, camera);
                };
                animate();

                return () => {
                    cancelAnimationFrame(animationFrame);
                    window.removeEventListener('resize', onResize);
                    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
                    renderer.domElement.removeEventListener('pointermove', onPointerMove);
                    renderer.domElement.removeEventListener('pointerup', onPointerUp);
                    renderer.domElement.removeEventListener('pointerleave', onPointerUp);
                    pointsRendererRef.current = null;
                    earthTexture?.dispose();
                    pointGeometry.dispose();
                    pointMaterial.dispose();
                    globeGeometry.dispose();
                    globeMaterial.dispose();
                    atmosphereGeometry.dispose();
                    atmosphereMaterial.dispose();
                    renderer.dispose();
                    if (mountRef.current?.contains(renderer.domElement)) mountRef.current.removeChild(renderer.domElement);
                };
            }, [threeStatus]);

            useEffect(() => {
                if (window.lucide) window.lucide.createIcons();
            }, [mapStatus, threeStatus]);

            const statusText = mapStatus === 'ready' ? 'Live data connected' : mapStatus === 'error' ? 'Live data unavailable' : 'Connecting to live data';
            const statusColor = mapStatus === 'ready' ? 'text-green-400' : mapStatus === 'error' ? 'text-amber-300' : 'text-blue-300';

            return (
                <section ref={sectionRef} aria-labelledby="visitor-map-title" className="py-24 bg-black text-white border-t border-gray-900 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className={`flex items-center gap-3 ${statusColor}`} aria-live="polite">
                                <span className="relative flex h-3 w-3"><span className={`absolute inline-flex h-full w-full rounded-full ${mapStatus === 'ready' ? 'animate-ping bg-green-400 opacity-75' : 'bg-current opacity-50'}`}></span><span className={`relative inline-flex rounded-full h-3 w-3 ${mapStatus === 'ready' ? 'bg-green-500' : 'bg-current'}`}></span></span>
                                <span className="text-xs font-bold uppercase tracking-widest">{statusText}</span>
                            </div>
                            <div>
                                <h2 id="visitor-map-title" className="text-4xl md:text-5xl font-serif font-bold mb-4">Global Reach.</h2>
                                <p className="text-gray-400 text-lg leading-relaxed max-w-md">A privacy-conscious, approximate view of recent visitor traffic. Drag the globe to explore the visitor points.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm"><div className="text-3xl font-mono font-bold text-white mb-1">{stats.total === null ? '—' : stats.total.toLocaleString()}</div><div className="text-xs text-gray-500 uppercase tracking-wider">Recorded Visits</div></div>
                                <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm"><div className="text-3xl font-mono font-bold text-blue-400 mb-1">{stats.live === null ? '—' : stats.live}</div><div className="text-xs text-gray-500 uppercase tracking-wider">Regions Shown</div></div>
                                <div className="col-span-2 p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm flex justify-between items-center"><div><div className="text-xl font-bold text-white mb-1">{stats.top}</div><div className="text-xs text-gray-500 uppercase tracking-wider">Top Region</div></div><i data-lucide="globe" className="w-8 h-8 text-gray-700"></i></div>
                            </div>
                            {mapStatus === 'error' && <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="inline-flex items-center gap-2 border border-amber-300/50 px-4 py-2 rounded-full text-sm font-medium text-amber-200 hover:bg-amber-300 hover:text-black transition-colors">Retry live map <i data-lucide="refresh-cw" className="w-4 h-4"></i></button>}
                        </div>
                        <div className="relative h-[380px] md:h-[500px] w-full flex items-center justify-center rounded-2xl overflow-hidden border border-white/5 bg-slate-950">
                            <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full transform scale-75 pointer-events-none"></div>
                            {threeStatus === 'ready' ? <div ref={mountRef} className="w-full h-full absolute inset-0 z-10 cursor-grab active:cursor-grabbing" aria-label="Interactive globe showing approximate visitor regions"></div> : <div className="relative z-10 text-gray-400 text-xs font-mono">{isVisible ? 'Initializing visitor map…' : 'Visitor map loads when visible.'}</div>}
                            <div className="absolute bottom-4 right-4 flex gap-4 text-[10px] text-white/60 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5 z-20"><span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white"></span> Visitor region</span><span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Live data</span></div>
                        </div>
                    </div>
                </section>
            );
        };

        // --- MAIN APP ---
        const App = () => {
            const readSection = () => { const id=window.location.hash.slice(1); return [...NAV_ITEMS.map(n=>n.id),'cv'].includes(id)?id:'home'; };
            const [activeSection, changeSection] = useState(readSection);
            const [showGlobe,setShowGlobe] = useState(false);
            const setActiveSection = (id) => { if(id===activeSection)return; window.history.pushState(null,'','#'+id);changeSection(id);window.scrollTo({top:0,behavior:'instant'}); };
            useEffect(()=>{const sync=()=>{changeSection(readSection());window.scrollTo(0,0);};window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync);};},[]);
            const [darkMode, setDarkMode] = useState(() => { let saved; try { saved=localStorage.getItem('theme'); } catch {} if (saved) return saved === 'dark'; return window.matchMedia('(prefers-color-scheme:dark)').matches; });
            const [searchOpen, setSearchOpen] = useState(false);
            const [toast, setToast] = useState({ message: '', isVisible: false });
            useLucideIcons(activeSection, darkMode, searchOpen, toast.isVisible);

            useEffect(() => {
                const metaThemeColor = document.querySelector("meta[name=theme-color]");
                if (darkMode) {
                    document.documentElement.classList.add('dark');
                    try {localStorage.setItem('theme', 'dark');} catch {}
                    if (metaThemeColor) metaThemeColor.setAttribute("content", "#050505");
                } else {
                    document.documentElement.classList.remove('dark');
                    try {localStorage.setItem('theme', 'light');} catch {}
                    if (metaThemeColor) metaThemeColor.setAttribute("content", "#ffffff");
                }
            }, [darkMode]);
            useEffect(() => { const handleK = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(p => !p); } }; window.addEventListener('keydown', handleK); return () => window.removeEventListener('keydown', handleK); }, []);

            const toggleTheme = () => setDarkMode(!darkMode);
            const triggerToast = (msg) => { setToast({ message: msg, isVisible: true }); setTimeout(() => setToast(p => ({ ...p, isVisible: false })), 3000); };

            return (
                <div className="min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 selection:bg-unc/20 selection:text-black dark:selection:text-white transition-colors duration-300">
                    {activeSection !== 'cv' && <CustomCursor />}
                    <a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus();}}>Skip to content</a>
                    <Toast message={toast.message} isVisible={toast.isVisible} />
                    {activeSection !== 'cv' && <Navbar activeSection={activeSection} setActiveSection={setActiveSection} darkMode={darkMode} toggleTheme={toggleTheme} setSearchOpen={setSearchOpen} />}
                    <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} sections={NAV_ITEMS} activeSection={activeSection} setActiveSection={setActiveSection} />
                    <main id="main-content" tabIndex="-1" className="flex-grow">
                        <React.Fragment>
                            {activeSection === 'home' && (
                                <div key="home">
                                    <Hero setActiveSection={setActiveSection} />
                                    <ResearchBrief setActiveSection={setActiveSection} />
                                    <DeferredSection>
                                        <NewsSection />
                                        <Stats />
                                    </DeferredSection>
                                </div>
                            )}
                            {activeSection === 'now' && <div key="now"><NowPage /></div>}
                            {activeSection === 'news' && <div key="news"><NewsSection /></div>}
                            {activeSection === 'research' && <div key="research"><Research /></div>}
                            {activeSection === 'projects' && <div key="projects"><Projects /></div>}
                            {activeSection === 'unc' && <div key="unc"><UNCSection setActiveSection={setActiveSection} /></div>}
                            {activeSection === 'art' && <div key="art"><ArtGallery /></div>}
                            {activeSection === 'contact' && <div key="contact"><Contact triggerToast={triggerToast} /></div>}
                            {activeSection === 'cv' && <CVViewer setActiveSection={setActiveSection} />}
                        </React.Fragment>
                    </main>
                    <Footer activeSection={activeSection} />
                    {activeSection === 'home' && (
                        <DeferredSection>
                            {showGlobe ? <VisitorGlobe /> : <div className="text-center py-8 text-sm"><button className="text-gray-500 dark:text-gray-400 underline underline-offset-4" onClick={()=>setShowGlobe(true)}>Load optional visitor globe (third-party service)</button></div>}
                        </DeferredSection>
                    )}
                    {activeSection !== 'cv' && <ChatWidget />}
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    