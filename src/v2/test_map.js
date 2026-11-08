setTimeout(() => { const out = [];
try{ settleModal(); $('#inp-name').value = 'Hugo'; $('#btn-name').click(); switchWorld('present');
  const cards = [...document.querySelectorAll('#map .region')];
  const hs = cards.map(c => c.getBoundingClientRect().height);
  const over = cards.flatMap(c => [...c.querySelectorAll('.sub,.need,h3')].filter(e => e.scrollWidth > e.clientWidth+1).map(e => e.textContent));
  out.push('w=' + innerWidth + ' hauteurs=' + hs.map(h => Math.round(h)).join(',') + ' débordements=' + (over.length ? over.join(' | ') : 'aucun'));
  out.push('subs: ' + cards.map(c => c.querySelector('.sub').textContent).join(' / '));
  out.push('need: ' + cards.map(c => c.querySelector('.need').textContent).join(' / '));
  out.push('strip: ' + [...document.querySelectorAll('.strip .card')].map(c => Math.round(c.getBoundingClientRect().height)).join(','));
  out.push('ex: ' + $('#h-tense-ex').textContent + ' | hint=' + !!$('#map-hint'));
}catch(e){ out.push('EXCEPTION '+e.message); }
document.body.setAttribute('data-test', out.join(' || ')); try{ parent.document.body.setAttribute('data-test', out.join(' || ')); }catch(e){} }, 500);
