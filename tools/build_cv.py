"""Update the supplied DOCX in place structurally, preserving its layout and styles.
Usage: python tools/build_cv.py /path/to/supplied-template.docx
The retained input is never modified. Render the output with render_docx.py.
"""
from pathlib import Path
from zipfile import ZipFile
from copy import deepcopy
from lxml import etree
import argparse,hashlib,json
W='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS={'w':W}; ROOT=Path(__file__).resolve().parents[1]
def q(t):return '{'+W+'}'+t

def build(template):
 with ZipFile(template) as z:
  source={n:z.read(n) for n in z.namelist()};root=etree.fromstring(source['word/document.xml'])
 body=root.find('w:body',NS);p=body.findall('w:p',NS)
 def text(el):return ''.join(el.itertext()) if False else ''.join(el.xpath('.//w:t/text()',namespaces=NS))
 def rewrite(el,segments):
  seed=el.find('w:r',NS);props=deepcopy(seed.find('w:rPr',NS)) if seed is not None and seed.find('w:rPr',NS) is not None else etree.Element(q('rPr'))
  for c in list(el):
   if c.tag!=q('pPr'):el.remove(c)
  for value,bold,italic in segments:
   r=etree.SubElement(el,q('r'));rp=deepcopy(props)
   for tag,flag in [('b',bold),('i',italic)]:
    for old in rp.findall(q(tag)):rp.remove(old)
    e=etree.SubElement(rp,q(tag));e.set(q('val'),'1' if flag else '0')
   r.append(rp);t=etree.SubElement(r,q('t'));t.set('{http://www.w3.org/XML/1998/namespace}space','preserve');t.text=value
 def plain(el,t,italic=False,bold=False):rewrite(el,[(t,bold,italic)])
 # Keep the uploaded formatting and existing publicly supplied career entries.
 for t in root.xpath('.//w:t',namespaces=NS):
  if t.text:t.text=t.text.replace('Expected May 2027','Expected July 2027')
 # Public professional contact only; keep hyperlinks and paragraph geometry elsewhere.
 plain(p[3],'Email: yihan012@e.ntu.edu.sg | zhayihan@unc.edu')
 plain(p[27],'NTU LKCMedicine Research Project | iAIM 2026 Poster Accepted | Sole Author',italic=True)
 rewrite(p[31],[('CUSP: Integrated Health Information and Care Workflows',True,False),(' | NTU Healthcare AI Innovation Project · 2026',False,False)])
 plain(p[33],'•  Leading a 17-member team spanning clinical/user research, data/ML, product/UX, and regulatory/business work.')
 plain(p[34],'•  Defined low-burden wearable and optional CGM-enhanced monitoring with longitudinal personal baselines, AI interpretation, and bounded assistance.')
 plain(p[35],'•  Building source-aware drafts, review, and correction workflows across personal insight and professional handoffs.')
 plain(p[38],'•  Designed tangible charging and feedback to support bedtime smartphone disengagement using behavioral economics.')
 plain(p[39],'•  Conducted mixed-method user research and translated behavioral friction points into interaction mechanics and prototype requirements.')
 # Insert current Motion findings using the source's own title, italic metadata, and bullet patterns.
 motion=[]
 for template_p,segments in [
  (p[31],[('Motion Audit: Pose-Derived Motion Measurements',True,False),(' | Independent Research · 2026',False,False)]),
  (p[32],[('Measurement-Chain Evaluation | Manuscript in Preparation',False,True)]),
  (p[33],[('•  Audits world reference, projection, and keypoints under shared counting and angle rules. Paired equipment changes expose task-dependent effects and endpoint masking.',False,False)]),
  (p[33],[('•  On 12 new synthetic bodies, separate angle processing with unchanged event counts improves complete success from 72.11% to 88.19% (+16.09 points; body-paired 95% CI [13.31, 18.75]); a secondary output-specific counting recipe reaches 92.59%.',False,False)])]:
  el=deepcopy(template_p);rewrite(el,segments);motion.append(el)
 insert=body.index(p[31])
 for el in motion:body.insert(insert,el);insert+=1
 # Add the ECG work compactly using a source project entry, rather than a new visual structure.
 ecg=deepcopy(p[33]);plain(ecg,'•  Related ECG course research examines source-specific concept measurements and calibration across reference procedures.')
 body.insert(body.index(p[35])+1,ecg)
 data=dict(source);data['word/document.xml']=etree.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
 if 'docProps/core.xml' in data:
  core=etree.fromstring(data['docProps/core.xml'])
  for tag in ['{http://purl.org/dc/elements/1.1/}creator','{http://schemas.openxmlformats.org/package/2006/metadata/core-properties}lastModifiedBy']:
   el=core.find(tag)
   if el is not None:el.text='Yihan Zhang'
  data['docProps/core.xml']=etree.tostring(core,xml_declaration=True,encoding='UTF-8',standalone=True)
 out=ROOT/'profile/Yihan_Zhang_CV.docx'
 with ZipFile(out,'w') as z:
  with ZipFile(template) as original:
   for info in original.infolist():z.writestr(info,data[info.filename])
 changed=[n for n in source if source[n]!=data[n]]
 assert set(changed)<= {'word/document.xml','docProps/core.xml'}
 # CV text counterpart contains professional content, not a copy of private contact metadata.
 paragraphs=[''.join(el.xpath('.//w:t/text()',namespaces=NS)) for el in body.findall('w:p',NS)]
 (ROOT/'profile/Yihan_Zhang_CV.md').write_text('\n\n'.join(paragraphs)+'\n')
 print(json.dumps({'output':str(out),'changed_parts':changed,'source_unchanged':hashlib.sha256(Path(template).read_bytes()).hexdigest()},indent=2))
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('template');build(parser.parse_args().template)
