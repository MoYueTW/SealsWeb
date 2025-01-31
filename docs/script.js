/* --------------------
   script.js (完整範例)
--------------------- */
const rainbowBtn       = document.getElementById('rainbowBtn');
const sealShake        = document.getElementById('sealShake');
const sealInner        = document.getElementById('sealInner');
const fartSound        = document.getElementById('fartSound');
const hintText         = document.getElementById('hintText');

// 這裡不再直接取得 marqueeContainer / marqueeContent
// 因為我們要動態生成

// 是否正在進行海豹點擊動畫中 (避免衝突)
let isPlaying = false;

// -------------------------------------
// 1. 等 DOM 載入後，動態插入 footer 與 跑馬燈
// -------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  // (1) 建立 Footer 區塊
  const footerDiv = document.createElement('div');
  footerDiv.className = 'footer-text animate__animated animate__slideInRight animate__fadeIn';
  footerDiv.textContent = 'Website by DaP & ChatGPT';
  document.body.appendChild(footerDiv);
  
  // (2) 建立 跑馬燈容器 & 內容
  const marqueeContainer = document.createElement('div');
  marqueeContainer.className = 'marquee-container';
  const marqueeContent = document.createElement('div');
  marqueeContent.className = 'marquee';
  marqueeContent.id = 'marqueeContent';
  
  // 文字末尾加空白，以便最後字+空白都出螢幕才重新出現
  marqueeContent.textContent = '海豹小夥伴: ShuZhi,  ChenRay,  YuXiang,  HongYi,  4J,  DaP,  MoYue,  Ace,  Gimi_Hsu,  a0406, 海外分部: Otisuki '; 
  // 加到 container => 加到 body
  marqueeContainer.appendChild(marqueeContent);
  document.body.appendChild(marqueeContainer);

  // (3) 載入時海豹 & 提示文字的 bounceIn
  sealInner.classList.add('animate__animated', 'animate__bounceIn');
  hintText.classList.add('animate__animated', 'animate__bounceIn');
  sealInner.addEventListener('animationend', function sealLoadEnd() {
    sealInner.classList.remove('animate__animated', 'animate__bounceIn');
    sealInner.removeEventListener('animationend', sealLoadEnd);
  });
  hintText.addEventListener('animationend', function hintLoadEnd() {
    hintText.classList.remove('animate__animated', 'animate__bounceIn');
    hintText.removeEventListener('animationend', hintLoadEnd);
  });

  // (4) 啟動跑馬燈
  startMarquee(marqueeContainer, marqueeContent);
});

// -------------------------------------
// 2. 提示文字 hover 行為
//    與之前相同 (多階段抖動+噴汗)
// -------------------------------------
let stage1Timer = null;
let stage2Timer = null;
let sweatInterval = null;

hintText.addEventListener('mouseenter', () => {
  if (isPlaying) return;
  
  // 立刻單次抖動
  hintText.classList.remove('shake-once', 'shake-forever');
  hintText.classList.add('shake-once');
  setTimeout(() => {
    hintText.classList.remove('shake-once');
  }, 300);

  // 2秒後 => 不是我>< + 持續抖動
  stage1Timer = setTimeout(() => {
    if (hintText.matches(':hover')) {
      hintText.textContent = '不是我><';
      hintText.classList.add('shake-forever');
    }
  }, 2000);

  // 5秒 => 瘋狂噴汗水
  stage2Timer = setTimeout(() => {
    if (hintText.matches(':hover')) {
      sweatInterval = setInterval(() => {
        if (!hintText.matches(':hover')) return;
        const sweat = document.createElement('span');
        sweat.classList.add('sweat-emoji');
        sweat.textContent = '💦';
        hintText.appendChild(sweat);
        sweat.addEventListener('animationend', () => {
          sweat.remove();
        });
      }, 1000);
    }
  }, 5000);
});

hintText.addEventListener('mouseleave', () => {
  // 重置
  hintText.textContent = '點海豹有驚喜 (Click "🦭" !)';
  hintText.classList.remove('shake-once', 'shake-forever');
  clearTimeout(stage1Timer);
  clearTimeout(stage2Timer);
  if (sweatInterval) {
    clearInterval(sweatInterval);
    sweatInterval = null;
  }
});

// -------------------------------------
// 3. 跑馬燈：單次跑完 -> 等1秒 -> 重複
//    與之前一樣，只是改為接收參數
// -------------------------------------
const speed = 1; // 文字往左移動的速度

function startMarquee(marqueeContainer, marqueeContent) {
  // 起始放在螢幕右側
  let offset = marqueeContainer.clientWidth;

  function cycle() {
    const containerWidth = marqueeContainer.clientWidth;
    const textWidth = marqueeContent.scrollWidth;

    let rafId;
    function step() {
      offset -= speed;
      marqueeContent.style.transform = `translateX(${offset}px)`;
      // 若最後字 + 空白 都出左側 => 停1秒再回到右邊
      if (offset + textWidth < 0) {
        cancelAnimationFrame(rafId);
        setTimeout(() => {
          offset = containerWidth;
          cycle(); // restart
        }, 1000);
      } else {
        rafId = requestAnimationFrame(step);
      }
    }
    rafId = requestAnimationFrame(step);
  }

  cycle();
}

// -------------------------------------
// 4. 點海豹：海豹抖動+旋轉、放屁聲、💩飛
//    與之前相同
// -------------------------------------
sealInner.addEventListener('click', () => {
  if (isPlaying) return;
  isPlaying = true;

  // 按鈕做淡出
  rainbowBtn.classList.add('fade-out');
  // 海豹抖動
  sealShake.classList.add('shaking');
  // 旋轉放大
  sealInner.classList.add('spin-and-grow');

  // 提示文字 => fadeOutDown
  hintText.classList.remove('shake-once', 'shake-forever', 'animate__bounceIn', 'animate__fadeOutDown');
  hintText.classList.add('animate__animated', 'animate__fadeOutDown');

  // 3秒後停止抖動
  setTimeout(() => {
    sealShake.classList.remove('shaking');
  }, 3000);

  // 4秒後 => 放屁 + 💩
  setTimeout(() => {
    fartSound.play().catch(err => console.warn("音效無法自動播放：", err));
    const poop = document.createElement('div');
    poop.classList.add('poop-emoji');
    poop.textContent = '💩';
    document.querySelector('.seal-outer').appendChild(poop);

    // 💩 飛行結束後 => 移除，復原
    poop.addEventListener('animationend', () => {
      poop.remove();
      
      rainbowBtn.classList.remove('fade-out');
      sealInner.classList.remove('spin-and-grow');
      sealInner.classList.add('animate__animated', 'animate__bounceIn');
      sealInner.addEventListener('animationend', function handleSealBounce() {
        sealInner.classList.remove('animate__animated', 'animate__bounceIn');
        sealInner.removeEventListener('animationend', handleSealBounce);
      });

      hintText.classList.remove('animate__fadeOutDown');
      hintText.classList.add('animate__animated', 'animate__bounceIn');
      hintText.addEventListener('animationend', function handleHintBounce() {
        hintText.classList.remove('animate__animated', 'animate__bounceIn');
        hintText.removeEventListener('animationend', handleHintBounce);
      });

      sealInner.style.transform = '';
      isPlaying = false;
    });
  }, 4000);
});
