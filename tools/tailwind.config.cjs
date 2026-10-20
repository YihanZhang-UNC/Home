module.exports = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        unc: {
                            DEFAULT: '#4B9CD3', // Carolina Blue
                            light: '#7BAFD4',
                            dark: '#13294B'
                        },
                        moma: {
                            red: '#E4002B', // MoMA/Art Red
                            black: '#000000',
                            white: '#FFFFFF'
                        }
                    },
                    fontFamily: {
                        sans: ['Geist', 'system-ui', 'sans-serif'],
                        serif: ['Georgia', 'serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    },
                    animation: {
                        'blob': 'blob 12s infinite ease-in-out',
                        'fade-in': 'fadeIn 0.5s ease-out forwards',
                        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    },
                    keyframes: {
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' },
                        }
                    }
                }
            }
        };
module.exports.content=['./index.html','./profile/app.jsx'];
