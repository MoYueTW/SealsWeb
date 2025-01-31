/* --------------------
   (1) 海豹網站核心
--------------------- */

const rainbowBtn  = document.getElementById('rainbowBtn');
const sealShake   = document.getElementById('sealShake');
const sealInner   = document.getElementById('sealInner');
const fartSound   = document.getElementById('fartSound');
const hintText    = document.getElementById('hintText');
let isPlaying     = false;  // 是否正在進行海豹動畫

window.addEventListener('DOMContentLoaded', () => {
  // Footer
  const footerDiv = document.createElement('div');
  footerDiv.className = 'footer-text animate__animated animate__slideInRight animate__fadeIn';
  footerDiv.textContent = 'Website by DaP & ChatGPT';
  document.body.appendChild(footerDiv);
  
  // Marquee
  const marqueeContainer = document.createElement('div');
  marqueeContainer.className = 'marquee-container';
  const marqueeContent = document.createElement('div');
  marqueeContent.className = 'marquee';
  marqueeContent.id = 'marqueeContent';
  marqueeContent.textContent = '海豹小夥伴: ShuZhi, ChenRay, YuXiang, HongYi, 4J, DaP, MoYue, Ace, Gimi_Hsu, a0406. 海外分部: Otisuki ';
  marqueeContainer.appendChild(marqueeContent);
  document.body.appendChild(marqueeContainer);

  // 海豹 & 提示文字：載入時的動畫
  sealInner.classList.add('animate__animated', 'animate__bounceIn');
  hintText.classList.add('animate__animated', 'animate__bounceIn');
  sealInner.addEventListener('animationend', () => {
    sealInner.classList.remove('animate__animated', 'animate__bounceIn');
  });
  hintText.addEventListener('animationend', () => {
    hintText.classList.remove('animate__animated', 'animate__bounceIn');
  });

  // 跑馬燈
  startMarquee(marqueeContainer, marqueeContent);

  // 初始化音樂播放器 + LRC
  initMusicPlayer();
});

/* 提示文字 - hover多階段抖動 */
let stage1Timer = null;
let stage2Timer = null;
let sweatInterval = null;

hintText.addEventListener('mouseenter', () => {
  if (isPlaying) return;
  hintText.classList.remove('shake-once','shake-forever');
  hintText.classList.add('shake-once');
  setTimeout(() => hintText.classList.remove('shake-once'), 300);

  stage1Timer = setTimeout(() => {
    if (hintText.matches(':hover')) {
      hintText.textContent = '不是我><';
      hintText.classList.add('shake-forever');
    }
  }, 2000);

  stage2Timer = setTimeout(() => {
    if (hintText.matches(':hover')) {
      sweatInterval = setInterval(() => {
        if (!hintText.matches(':hover')) return;
        const sweat = document.createElement('span');
        sweat.classList.add('sweat-emoji');
        sweat.textContent = '💦';
        hintText.appendChild(sweat);
        sweat.addEventListener('animationend', () => sweat.remove());
      }, 1000);
    }
  }, 5000);
});

hintText.addEventListener('mouseleave', () => {
  hintText.textContent = '點海豹有驚喜 (Click "🦭" !)';
  hintText.classList.remove('shake-once','shake-forever');
  clearTimeout(stage1Timer);
  clearTimeout(stage2Timer);
  if (sweatInterval){
    clearInterval(sweatInterval);
    sweatInterval = null;
  }
});

/* 跑馬燈：單次跑完 -> 等1秒 -> 重複 */
function startMarquee(marqueeContainer, marqueeContent) {
  let offset = marqueeContainer.clientWidth;
  const speed = 1;
  function cycle() {
    const containerWidth = marqueeContainer.clientWidth;
    const textWidth = marqueeContent.scrollWidth;
    let rafId;
    function step() {
      offset -= speed;
      marqueeContent.style.transform = `translateX(${offset}px)`;
      if (offset + textWidth < 0) {
        cancelAnimationFrame(rafId);
        setTimeout(() => {
          offset = containerWidth;
          cycle();
        }, 1000);
      } else {
        rafId = requestAnimationFrame(step);
      }
    }
    rafId = requestAnimationFrame(step);
  }
  cycle();
}

/* 海豹點擊 -> 抖動 + 旋轉放大 + 放屁 💩 */
sealInner.addEventListener('click', () => {
  if (isPlaying) return;
  isPlaying = true;

  rainbowBtn.classList.add('fade-out');
  sealShake.classList.add('shaking');
  sealInner.classList.add('spin-and-grow');
  hintText.classList.remove('shake-once','shake-forever','animate__bounceIn','animate__fadeOutDown');
  hintText.classList.add('animate__animated','animate__fadeOutDown');

  setTimeout(() => sealShake.classList.remove('shaking'), 3000);

  setTimeout(() => {
    fartSound.play().catch(err => console.warn("音效無法自動播放：", err));
    const poop = document.createElement('div');
    poop.classList.add('poop-emoji');
    poop.textContent = '💩';
    document.querySelector('.seal-outer').appendChild(poop);

    poop.addEventListener('animationend', () => {
      poop.remove();
      rainbowBtn.classList.remove('fade-out');
      sealInner.classList.remove('spin-and-grow');
      sealInner.classList.add('animate__animated','animate__bounceIn');
      sealInner.addEventListener('animationend', function handleBounce() {
        sealInner.classList.remove('animate__animated','animate__bounceIn');
        sealInner.removeEventListener('animationend', handleBounce);
      });
      hintText.classList.remove('animate__fadeOutDown');
      hintText.classList.add('animate__animated','animate__bounceIn');
      hintText.addEventListener('animationend', function handleHintBounce() {
        hintText.classList.remove('animate__animated','animate__bounceIn');
        hintText.removeEventListener('animationend', handleHintBounce);
      });
      sealInner.style.transform = '';
      isPlaying = false;
    });
  }, 4000);
});


/* -------------------------------
   (2) 音樂播放器 + LRC
   - 全部歌詞顯示
   - 已唱過 => 粉色
   - 正在唱 => 粉色
   - 未來 => 白色
   - 可點擊歌詞 => 跳到時間
   - 若滾動離目前行太遠 => 停止自動捲動
   - 若滾回接近 => 恢復自動捲動
   - 播放鍵改為白色
------------------------------- */

function initMusicPlayer() {
  const track = {
    file: '星座になれたら.mp3',
    cover: '星座になれたら.jpeg',
    title: '星座になれたら',
    lrc:  'seiza_3lang.lrc'
  };

  const container = document.getElementById('musicPlayerContainer');
  const playerDiv = document.createElement('div');
  playerDiv.className = 'music-player';
  playerDiv.style.backgroundImage = `url('${track.cover}')`;
  playerDiv.innerHTML = `
    <div class="player-content">
      <div class="cover-area">
        <img src="${track.cover}" alt="Cover" />
      </div>
      <div class="info-area">
        <div class="track-title">${track.title}</div>
        <div class="lyrics-box" id="lyricsBox"></div>
        <div class="controls">
          <!-- 播放鍵改成白色 (用CSS) -->
          <button class="play-pause-btn" id="playPauseBtn">►</button>
          <span class="current-time" id="currentTime">0:00</span>
          <input type="range" id="progressBar" value="0" min="0" max="100">
          <span class="total-time" id="totalTime">0:00</span>
        </div>
      </div>
    </div>
    <audio src="${track.file}" id="audioPlayer"></audio>
  `;
  container.appendChild(playerDiv);

  const audio          = playerDiv.querySelector('#audioPlayer');
  const playPauseBtn   = playerDiv.querySelector('#playPauseBtn');
  const progressBar    = playerDiv.querySelector('#progressBar');
  const currentTimeLbl = playerDiv.querySelector('#currentTime');
  const totalTimeLbl   = playerDiv.querySelector('#totalTime');
  const lyricsBox      = playerDiv.querySelector('#lyricsBox');

  let isDragging   = false;
  let lrcData      = [];
  let autoScroll   = true;  // 是否啟用自動捲動
  let activeIndex  = -1;    // 目前行索引

  /* 播放 / 暫停 */
  playPauseBtn.addEventListener('click', () => {
    if(audio.paused) {
      audio.play();
      playPauseBtn.textContent = '❚❚';
    } else {
      audio.pause();
      playPauseBtn.textContent = '►';
    }
  });

  /* 時間更新 -> 進度 + 歌詞 */
  audio.addEventListener('timeupdate', () => {
    if(!isDragging) {
      const progress = (audio.currentTime / audio.duration) * 100;
      progressBar.value = progress;
    }
    currentTimeLbl.textContent = formatTime(audio.currentTime);
    highlightLyrics(audio.currentTime);
  });

  /* 音檔載入後 -> 顯示總時長 */
  audio.addEventListener('loadedmetadata', () => {
    totalTimeLbl.textContent = formatTime(audio.duration);
  });

  /* 拖曳進度條 */
  progressBar.addEventListener('input', () => { isDragging = true; });
  progressBar.addEventListener('change', () => {
    const newTime = (progressBar.value / 100) * audio.duration;
    audio.currentTime = newTime;
    isDragging = false;
  });

  /* 讀取LRC -> 解析 -> 顯示 */
  fetch(track.lrc)
    .then(res => res.text())
    .then(raw => {
      lrcData = parseLRC(raw);
      lrcData.forEach((obj, i) => {
        const p = document.createElement('p');
        p.className = 'lyrics-line upcoming-line'; // 預設是 "未來(白色)"
        p.innerHTML = obj.text;
        // 點擊歌詞 => 跳到該時間
        p.addEventListener('click', () => {
          audio.currentTime = obj.time;
          highlightLyrics(obj.time);
        });
        lyricsBox.appendChild(p);
      });
    })
    .catch(err => console.log('LRC載入失敗', err));

  /* 解析LRC: [mm:ss.xx] + 文字 */
  function parseLRC(raw){
    let result = [];
    const lines = raw.split('\n');
    const timeReg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/;
    for(let str of lines){
      const match = str.match(timeReg);
      if(!match) continue;
      let mm = parseInt(match[1], 10);
      let ss = parseInt(match[2], 10);
      let ms = match[3] ? parseInt(match[3], 10) : 0;
      let totalSec = mm*60 + ss + (ms/100);
      let text = str.replace(timeReg,'').trim();
      result.push({ time: totalSec, text });
    }
    return result;
  }

  /* 歌詞框捲動事件 => 若滾輪離目前行太遠 => 關閉自動捲動 */
  lyricsBox.addEventListener('scroll', () => {
    if(activeIndex<0) return;
    const linesDom  = lyricsBox.querySelectorAll('.lyrics-line');
    if(!linesDom[activeIndex]) return;
    const boxHeight = lyricsBox.clientHeight;
    const lineTop   = linesDom[activeIndex].offsetTop;
    const lineMid   = lineTop + linesDom[activeIndex].clientHeight/2;
    const boxScroll = lyricsBox.scrollTop;
    const boxCenter = boxScroll + boxHeight/2;
    const diff      = Math.abs(lineMid - boxCenter);

    // 如果滾動離 "目前行" 的距離 > 100，關閉自動捲動
    if(diff>100 && autoScroll){
      autoScroll = false;
    }
    // 如果又靠近了(50以內) => 再度開啟
    else if(diff<50 && !autoScroll){
      autoScroll = true;
    }
  });

  /* Highlight: sung -> 粉, current -> 粉, future -> 白
     全部顯示, 不關閉行 
  */
  function highlightLyrics(currentSec){
    // 找到 activeIndex
    let newIndex = -1;
    for(let i=0; i<lrcData.length; i++){
      if(currentSec >= lrcData[i].time){
        newIndex = i;
      } else {
        break;
      }
    }
    // 將行索引更新
    activeIndex = newIndex;
    
    const linesDom = lyricsBox.querySelectorAll('.lyrics-line');
    linesDom.forEach((line, i) => {
      line.classList.remove('past-line','active-line','upcoming-line');
      // 已唱過 => past-line => 黃色
      if(i<activeIndex){
        line.classList.add('past-line');
      }
      // 正在唱 => active-line => 亮藍
      else if(i===activeIndex){
        line.classList.add('active-line');
      }
      // 未來 => upcoming-line => 白色
      else {
        line.classList.add('upcoming-line');
      }
    });
    
    // 自動捲動 => 只有 autoScroll==true 時執行
    if(autoScroll && activeIndex>=0 && activeIndex<linesDom.length){
      const currentLine = linesDom[activeIndex];
      // 平滑捲動 => 讓目前行在 lyricsBox 中置中
      const boxHeight = lyricsBox.clientHeight;
      const lineTop   = currentLine.offsetTop;
      const lineMid   = lineTop + currentLine.clientHeight/2;
      const newScroll = lineMid - boxHeight/2;
      lyricsBox.scrollTo({
        top: newScroll,
        behavior: 'smooth'
      });
    }
  }

  /* 格式化秒數 */
  function formatTime(sec){
    if(!sec||sec<0) sec=0;
    const m = Math.floor(sec/60);
    const s = Math.floor(sec%60);
    return m+':' + (s<10 ? '0'+s : s);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const musicPlayer = document.querySelector('.music-player');

  setTimeout(() => {
    musicPlayer.classList.add('animate__animated', 'animate__fadeInLeft');
    musicPlayer.style.opacity = '1'; // 確保可見
  }, 300);
});
