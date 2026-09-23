
(() => {
  const foodMap = new Map(window.FOOD_DB.map(x => [x.id, x]));
  const STORAGE_KEY = "foodWorldcup128State_v2";
  const iconRules = [
    [/피자/, "🍕"], [/햄버거/, "🍔"], [/치킨|닭|야키토리|너겟/, "🍗"], [/김밥|초밥/, "🍣"],
    [/사시미|회|물회/, "🐟"], [/라면|라멘|우동|소바|짜장면|짬뽕|쌀국수|팟타이|칼국수|쫄면|비빔국수|잔치국수|수제비|냉면|막국수|미고렝/, "🍜"],
    [/비빔밥|볶음밥|덮밥|규동|오야코동|리조또|나시고렝|카오팟|빠에야/, "🍚"],
    [/찌개|탕|국|삼계탕|설렁탕|감자탕|훠궈|마라탕|똠얌꿍|스튜/, "🍲"], [/떡볶이|떡국/, "🍡"],
    [/순대|곱창|족발|보쌈|삼겹살|불고기|갈비|스테이크|비프|케밥|샤와르마|제육볶음/, "🥩"],
    [/새우|감바스|깐쇼새우/, "🦐"], [/조개/, "🦪"], [/대게|랍스터/, "🦞"], [/샐러드|월남쌈/, "🥗"],
    [/과일|아사이볼/, "🍓"], [/아이스크림|빙수/, "🍨"], [/케이크|타르트/, "🍰"], [/도넛/, "🍩"],
    [/크루아상|반미|토스트|샌드위치/, "🥪"], [/초콜릿/, "🍫"], [/쿠키/, "🍪"], [/와플|팬케이크/, "🧇"],
    [/푸딩|요거트/, "🍮"], [/타코|부리토|케사디야/, "🌮"], [/카레|마살라|버터치킨/, "🍛"], [/딤섬/, "🥟"],
    [/튀김|돈카츠|탕수육|깐풍기|유린기|피시앤칩스|팔라펠/, "🍤"], [/파스타|라자냐|뇨키/, "🍝"], [/치즈|그라탱|퐁뒤/, "🧀"], [/후무스/, "🫘"], [/핫도그/, "🌭"]
  ];
  const iconFor = name => (iconRules.find(([r]) => r.test(name)) || [null, "🍽️"])[1];
  const roundLabel = n => n === 2 ? "결승" : n === 4 ? "4강" : n === 8 ? "8강" : `${n}강`;
  const initialState = () => ({
    started:false,
    roundSize:128,
    round: window.R128_PAIRS.map(p => [p.a, p.b]),
    matchIndex:0,
    nextRound:[],
    history:[],
    champion:null
  });

  let state = initialState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.round)) state = saved;
  } catch(e) {}

  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function reset(){
    if(!confirm("진행 중인 월드컵을 처음부터 다시 시작할까요?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = initialState();
    render();
  }
  function start(){ state.started = true; save(); render(); }

  function selectWinner(id){
    const pair = state.round[state.matchIndex];
    const loser = pair[0] === id ? pair[1] : pair[0];
    state.history.push({ round:state.roundSize, winner:id, loser, matchIndex:state.matchIndex });
    state.nextRound.push(id);
    if(state.matchIndex < state.round.length - 1){
      state.matchIndex++;
    } else {
      if(state.roundSize === 2){
        state.champion = id;
      } else {
        const winners = state.nextRound.slice();
        const next = [];
        for(let i=0;i<winners.length;i+=2) next.push([winners[i], winners[i+1]]);
        state.roundSize /= 2;
        state.round = next;
        state.nextRound = [];
        state.matchIndex = 0;
      }
    }
    save(); render();
  }

  function undo(){
    if(!state.history.length) return;
    const keep = state.history.slice(0,-1);
    state = initialState();
    state.started = true;
    state.history = [];
    for(const item of keep){
      state.history.push(item);
      state.nextRound.push(item.winner);
      if(state.matchIndex < state.round.length - 1){
        state.matchIndex++;
      } else if (state.roundSize !== 2){
        const winners = state.nextRound.slice();
        const next = [];
        for(let i=0;i<winners.length;i+=2) next.push([winners[i], winners[i+1]]);
        state.roundSize /= 2;
        state.round = next;
        state.nextRound = [];
        state.matchIndex = 0;
      }
    }
    save(); render();
  }

  function getDescription(food){
    const first = `${food.name}는 ${food.region}권에서 사랑받는 ${food.category} 계열 음식이에요. 주재료는 ${food.ingredient}이고, 주로 ${food.cooking} 방식으로 만들어져 ${food.taste}의 매력이 살아납니다.`;
    const second = `${food.type} 형태의 음식이라 한입의 인상도 분명하고, ${food.class} 체급에 속해 월드컵에서 같은 결의 음식들과 비교하며 고르기 좋습니다.`;
    const third = `${food.similarity} 유사군에 속하므로 비슷한 취향의 메뉴들과 닮은 점도 있지만, ${food.name}만의 개성과 만족감이 또렷한 편이에요.`;
    return `${first} ${second} ${third}`;
  }

  function frameType(food){
    if(/면|국|탕|찌개|라면|라멘|우동|소바|쌀국수|짬뽕|수제비|칼국수/.test(food.name) || /국·탕|찌개|면/.test(food.type)) return "bowl";
    if(/과일|아사이볼|아이스크림|빙수|요거트|푸딩/.test(food.name)) return "cup";
    if(/샐러드|케밥|샌드위치|반미|토스트|타코|부리토|케사디야|피자/.test(food.name)) return "board";
    return "plate";
  }

  function renderVisual(food){
    const frame = frameType(food);
    const steamNeeded = /국|탕|찌개|라면|라멘|우동|소바|카레|스튜|마살라|버터치킨|감바스|그라탱|퐁뒤|파스타|라자냐|뇨키|덮밥|볶음밥|비빔밥|탕수육|돈카츠|불고기|삼겹살/.test(food.name);
    const garnishNeeded = /샐러드|과일|아사이볼|초밥|회|사시미|월남쌈|반미|피자|파스타|카레|비빔밥|덮밥/.test(food.name);
    return `
      <div class="food-visual" aria-hidden="true">
        <div class="food-art">
          <div class="food-${frame}"></div>
          ${steamNeeded ? `<span class="food-garnish steam"></span><span class="food-garnish steam s2"></span>` : ``}
          ${garnishNeeded ? `<span class="food-garnish dot1"></span><span class="food-garnish dot2"></span><span class="food-garnish dot3"></span>` : ``}
          <div class="food-icon">${iconFor(food.name)}</div>
        </div>
      </div>
    `;
  }

  function chips(food){
    return `<div class="meta">
      <span class="chip">${food.category}</span>
      <span class="chip">${food.taste}</span>
      <span class="chip">${food.region}</span>
    </div>`;
  }

  function foodCard(id){
    const food = foodMap.get(id);
    return `<button class="food-card" data-pick="${food.id}" aria-label="${food.name} 선택">
      ${renderVisual(food)}
      <h2 class="food-name">${food.name}</h2>
      ${chips(food)}
      <div class="card-actions">
        <button class="info-btn" data-info="${food.id}" type="button">음식 설명 보기</button>
      </div>
      <div class="pick-note">카드 전체를 누르면 이 음식이 선택돼요</div>
    </button>`;
  }

  function openModal(id){
    const food = foodMap.get(id);
    const modal = document.getElementById("foodModal");
    const content = document.getElementById("modalContent");
    content.innerHTML = `
      <div class="modal-header">
        ${renderVisual(food)}
        <div>
          <h3 id="modalTitle" class="modal-title">${food.name}</h3>
          <div class="modal-sub">${food.region} · ${food.category} · ${food.class}</div>
          <div style="margin-top:10px">${chips(food)}</div>
        </div>
      </div>
      <div class="modal-body">
        <div class="desc-card">${getDescription(food)}</div>
        <div class="modal-grid">
          <div class="meta-box"><h4>주재료</h4><p>${food.ingredient}</p></div>
          <div class="meta-box"><h4>조리방식</h4><p>${food.cooking}</p></div>
          <div class="meta-box"><h4>음식 형태</h4><p>${food.type}</p></div>
          <div class="meta-box"><h4>유사군</h4><p>${food.similarity}</p></div>
        </div>
      </div>
    `;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(){
    const modal = document.getElementById("foodModal");
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
  }

  function renderStart(){
    return `<div class="shell hero">
      <section class="hero-card">
        <div class="kicker">FOOD WORLD CUP · ROUND OF 128</div>
        <h1>오늘 뭐 먹지?<br>음식 이상형 월드컵</h1>
        <p>128가지 음식 중 매 라운드 하나만 선택하세요. 비슷한 음식끼리 너무 빨리 만나지 않도록 균형 있게 짠 128강 대진에서, 당신의 최종 1위를 찾아봅니다.</p>
        <div class="actions">
          <button class="btn btn-primary" id="startBtn">${state.history.length ? "이어하기" : "128강 시작하기"}</button>
          ${state.history.length ? `<button class="btn btn-secondary" id="resetBtn">처음부터</button>` : ``}
        </div>
        <div class="rules">
          <div class="rule"><strong>대표 메뉴 기준</strong><span class="tiny">세부 변형은 대표 음식 단위로 통합</span></div>
          <div class="rule"><strong>균형 대진</strong><span class="tiny">같은 체급끼리 붙고 유사 메뉴는 초반 분리</span></div>
          <div class="rule"><strong>자연스러운 토너먼트</strong><span class="tiny">128강만 균형 배치, 이후는 승자끼리 진행</span></div>
        </div>
      </section>
    </div>`;
  }

  function renderGame(){
    const pair = state.round[state.matchIndex];
    const total = state.round.length;
    const pct = (state.matchIndex / total) * 100;
    return `<div class="shell">
      <header class="brand">
        <div class="logo">오늘 뭐 먹지? <b>WORLD CUP</b></div>
        <button class="btn btn-ghost" id="resetBtn">처음부터</button>
      </header>
      <div class="topbar">
        <div class="round-pill">${roundLabel(state.roundSize)}</div>
        <div class="progress-wrap"><div class="progress" style="width:${pct}%"></div></div>
        <div class="counter">${state.matchIndex+1} / ${total}</div>
      </div>
      <h1 class="match-title">더 먹고 싶은 음식은?</h1>
      <p class="match-sub">카드 전체를 누르면 선택되고, 아래 버튼을 누르면 음식 설명을 볼 수 있어요.</p>
      <section class="arena">
        ${foodCard(pair[0])}
        <div class="vs">VS</div>
        ${foodCard(pair[1])}
      </section>
      <div class="bottom-tools">
        <button class="btn btn-secondary" id="undoBtn" ${state.history.length ? "" : "disabled"}>↶ 이전 선택</button>
        <span class="tiny">PC에서는 ← / → 키로 빠르게 선택할 수 있어요.</span>
      </div>
    </div>`;
  }

  function renderResult(){
    const food = foodMap.get(state.champion);
    const recent = state.history.slice(-8).reverse();
    return `<div class="shell result">
      <section class="result-card">
        <div class="crown">🏆</div>
        <div class="kicker">YOUR NO.1 FOOD</div>
        ${renderVisual(food)}
        <h1>${food.name}</h1>
        ${chips(food)}
        <p>128가지 음식 끝에 남은 당신의 최종 선택입니다.<br><strong>${food.name}</strong>이 오늘의 음식 이상형 1위예요.</p>
        <div class="actions">
          <button class="btn btn-primary" id="resetBtn">다시 하기</button>
          <button class="btn btn-secondary" id="copyBtn">결과 복사</button>
          <button class="btn btn-secondary" id="winnerInfoBtn">음식 설명 보기</button>
        </div>
        <details class="history-list">
          <summary>마지막 선택 기록 보기</summary>
          <ol>${recent.map(h => `<li>${roundLabel(h.round)} · ${foodMap.get(h.winner).name} 승</li>`).join("")}</ol>
        </details>
        <div class="footer-note">결과는 브라우저에만 저장됩니다.</div>
      </section>
    </div>`;
  }

  function bind(){
    document.getElementById("startBtn")?.addEventListener("click", start);
    document.getElementById("resetBtn")?.addEventListener("click", reset);
    document.getElementById("undoBtn")?.addEventListener("click", undo);
    document.querySelectorAll("[data-pick]").forEach(card => {
      card.addEventListener("click", () => selectWinner(card.dataset.pick));
    });
    document.querySelectorAll("[data-info]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(btn.dataset.info);
      });
    });
    document.getElementById("winnerInfoBtn")?.addEventListener("click", () => openModal(state.champion));
    document.getElementById("copyBtn")?.addEventListener("click", async () => {
      const name = foodMap.get(state.champion).name;
      const text = `내 음식 이상형 월드컵 1위는 ${name}! 🏆`;
      try { await navigator.clipboard.writeText(text); alert("결과를 복사했어요."); }
      catch(e){ prompt("아래 문장을 복사하세요.", text); }
    });
    document.getElementById("modalCloseBtn")?.addEventListener("click", closeModal);
    document.querySelectorAll("[data-close-modal='true']").forEach(el => el.addEventListener("click", closeModal));
  }

  function render(){
    const app = document.getElementById("app");
    app.innerHTML = state.champion ? renderResult() : (!state.started ? renderStart() : renderGame());
    bind();
  }

  window.addEventListener("keydown", (e) => {
    const modalOpen = !document.getElementById("foodModal").classList.contains("hidden");
    if(e.key === "Escape" && modalOpen){ closeModal(); return; }
    if(modalOpen) return;
    if(!state.started || state.champion) return;
    if(e.key === "ArrowLeft") selectWinner(state.round[state.matchIndex][0]);
    if(e.key === "ArrowRight") selectWinner(state.round[state.matchIndex][1]);
  });

  render();
})();
