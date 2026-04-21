(function initNewsSlider(){
const slides=[
{img:'img/121.jpg',title:'"Disney Announces Groundbreaking <span>Virtual Reality Experience</span>"',desc:'Immerse yourself in the worlds of your favorite Disney films like never before.'},
{img:'img/300.jpg',title:'"Timeless Adventures" — <span>New Live-Action Film</span> Arrives February 2024',desc:'Step into centuries of history in a mesmerizing adventure that defies time itself.'},
{img:'img/200.jpg',title:"Tom Hanks Set to Star in <span>Disney's Biggest Adventure</span> of the Year",desc:'Award-winning actor brings his unmistakable talent to the Disney cinematic universe.'},
{img:'img/niccolo-candelise-uGKccSqwosw-unsplash.jpg',title:'The Wizarding World Returns — <span>New Spin-Off</span> Confirmed for 2025',desc:'A new chapter of magic, mystery, and wonder is coming to theatres worldwide.'}
];
const hero=document.querySelector('.news-hero');
if(!hero)return;
const bgImg=hero.querySelector('.news-hero-bg img');
const bgEl=hero.querySelector('.news-hero-bg');
const titleEl=hero.querySelector('.news-hero-content h2');
const descEl=hero.querySelector('.news-hero-content p');
const dotsWrap=hero.querySelector('.news-dots');
const arrowEl=hero.querySelector('.news-arrow');
if(bgImg)bgImg.style.opacity='1';
if(dotsWrap){
dotsWrap.innerHTML=slides.map((_,i)=>`<div class="dot${i===0?' active':''}" data-index="${i}"></div>`).join('');
}
let current=0,autoTimer=null,isAnimating=false,isPaused=false;
function goTo(idx){
if(isAnimating||idx===current)return;
isAnimating=true;
const slide=slides[idx];
if(bgImg)bgImg.style.opacity='0';
setTimeout(()=>{
if(bgImg)bgImg.src=slide.img;
else if(bgEl)bgEl.style.backgroundImage=`url('${slide.img}')`;
if(titleEl)titleEl.innerHTML=slide.title;
if(descEl)descEl.textContent=slide.desc;
if(dotsWrap){
dotsWrap.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
}
current=idx;
requestAnimationFrame(()=>{
requestAnimationFrame(()=>{
if(bgImg)bgImg.style.opacity='1';
setTimeout(()=>{isAnimating=false;if(!isPaused)startAuto();},450);
});
});
},300);
}
const next=()=>goTo((current+1)%slides.length);
const prev=()=>goTo((current-1+slides.length)%slides.length);
function startAuto(){clearInterval(autoTimer);autoTimer=setInterval(next,5000);}
function stopAuto(){clearInterval(autoTimer);}
hero.addEventListener('mouseenter',()=>{isPaused=true;stopAuto();});
hero.addEventListener('mouseleave',()=>{isPaused=false;if(!isAnimating)startAuto();});
if(arrowEl){
arrowEl.addEventListener('click',()=>{next();stopAuto();setTimeout(()=>{if(!isPaused)startAuto();},800);});
}
const leftArrow=document.createElement('div');
leftArrow.className='news-arrow news-arrow-left';
leftArrow.innerHTML='\u2039';
hero.appendChild(leftArrow);
leftArrow.addEventListener('click',()=>{prev();stopAuto();setTimeout(()=>{if(!isPaused)startAuto();},800);});
if(dotsWrap){
dotsWrap.addEventListener('click',e=>{
const dot=e.target.closest('.dot');
if(!dot)return;
goTo(parseInt(dot.dataset.index,10));
stopAuto();
setTimeout(()=>{if(!isPaused)startAuto();},800);
});
}
document.addEventListener('keydown',e=>{
if(e.key==='ArrowRight'){next();stopAuto();setTimeout(startAuto,800);}
if(e.key==='ArrowLeft'){prev();stopAuto();setTimeout(startAuto,800);}
});
let touchStartX=0;
hero.addEventListener('touchstart',e=>{touchStartX=e.touches[0].clientX;},{passive:true});
hero.addEventListener('touchend',e=>{
const dx=e.changedTouches[0].clientX-touchStartX;
if(Math.abs(dx)>50){
dx<0?next():prev();
stopAuto();
setTimeout(()=>{if(!isPaused)startAuto();},800);
}
});
startAuto();
})();