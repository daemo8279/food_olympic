
(() => {
  const foodMap = new Map(window.FOOD_DB.map(x => [x.id, x]));
  const STORAGE_KEY = "foodWorldcup128State_v1";

  const emojiRules = [
    [/피자/, "🍕"], [/햄버거/, "🍔"], [/치킨|닭|야키토리/, "🍗"], [/김밥|초밥/, "🍣"],
    [/라면|라멘/, "🍜"], [/국수|냉면|막국수|우동|소바|쌀국수|팟타이|미고렝|짜장면|짬뽕|쫄면|칼국수|수제비/, "🍜"],
    [/밥|비빔밥|볶음밥|덮밥|규동|오야코동|나시고렝|카오팟|리조또|빠에야/, "🍚"],
    [/찌개|탕|국|스튜|훠궈|마라탕|똠얌꿍/, "🍲"], [/떡볶이|떡국/, "🍡"],
    [/돼지|삼겹|족발|보쌈|제육|갈비|곱창|불고기|비프|소고기|스테이크|케밥|샤와르마/, "🥩"],
    [/새우|랍스터|대게/, "🦐"], [/조개/, "🦪"], [/회|사시미|생선|아귀|해물|물회/, "🐟"],
    [/샐러드|월남쌈/, "🥗"], [/과일|아사이/, "🍓"], [/아이스크림|빙수/, "🍨"],
    [/케이크|타르트/, "🍰"], [/도넛/, "🍩"], [/크루아상|빵|샌드위치|반미|토스트/, "🥐"],
    [/초콜릿/, "🍫"], [/쿠키/, "🍪"], [/와플|팬케이크/, "🧇"], [/푸딩|요거트/, "🍮"],
    [/타코|부리토|케사디야/, "🌮"], [/카레|마살라|버터치킨/, "🍛"], [/딤섬|만두/, "🥟"],
    [/감자튀김|튀김|돈카츠|탕수육|깐풍기|유린기|피시앤칩스|너겟|팔라펠/, "🍤"],
    [/파스타|라자냐|뇨키/, "🍝"], [/치즈|그라탱|퐁뒤/, "🧀"], [/후무스/, "🫘"],
  ];
  const emojiFor = name => (emojiRules.find(([r]) => r.test(name)) || [null,"🍽️"])[1];

  const roundLabel = n => n === 2 ? "결승" : n === 4 ? "4강" : n === 8 ? "8강" : `${n}강`;

  const initialState = () => ({
    started:false,
    roundSize:128,
    round: window.R128_PAIRS.map(p => [p.a,p.b]),
    matchIndex:0,
    nextRound:[],
    history:[],
    champion:null
  });

  let state = initialState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.round && Array.isArray(saved.round)) state = saved;
  } catch(e) {}

  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function reset(){
    if (!confirm("진행 중인 월드컵을 처음부터 다시 시작할까요?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = initialState();
    render();
  }

  function start(){ state.started = true; save(); render(); }

  function selectWinner(id){
    const pair = state.round[state.matchIndex];
    const loser = pair[0] === id ? pair[1] : pair[0];
    state.history.push({
      round: state.roundSize,
      winner:id,
      loser,
      matchIndex:state.matchIndex
    });
    state.nextRound.push(id);

    if (state.matchIndex < state.round.length - 1){
      state.matchIndex++;
    } else {
      if (state.roundSize === 2){
        state.champion = id;
      } else {
        const winners = state.nextRound.slice();
        const next = [];
        for(let i=0;i<winners.length;i+=2) next.push([winners[i], winners[i+1]]);
        state.roundSize = state.roundSize / 2;
        state.round = next;
        state.nextRound = [];
        state.matchIndex = 0;
      }
    }
    save(); render();
  }

  function undo(){
    if (!state.history.length) return;
    const h = state.history.pop();
    // Reconstruct state from scratch by replaying history except last.
    const keep = state.history.slice();
    state = initialState();
    state.started = true;
    state.history = [];
    for(const item of keep){
      const pair = state.round[state.matchIndex];
      const winner = item.winner;
      state.history.push(item);
      state.nextRound.push(winner);
      if (state.matchIndex < state.round.length - 1) state.matchIndex++;
      else {
        if(state.roundSize !== 2){
          const winners=state.nextRound.slice(), next=[];
          for(let i=0;i<winners.length;i+=2) next.push([winners[i],winners[i+1]]);
          state.roundSize/=2; state.round=next; state.nextRound=[]; state.matchIndex=0;
        }
      }
    }
    save(); render();
  }

  function foodCard(id){
    const f=foodMap.get(id);
    return `<button class="food-card" data-pick="${f.id}" aria-label="${f.name} 선택">
      <div class="emoji">${emojiFor(f.name)}</div>
      <h2 class="food-name">${f.name}</h2>
      <div class="meta">
        <span class="chip">${f.category}</span>
        <span class="chip">${f.taste}</span>
        <span class="chip">${f.region}</span>
      </div>
      <div class="pick">이 음식 선택하기 →</div>
    </button>`;
  }

  function renderStart(){
    return `<div class="shell hero">
      <section class="hero-card">
        <div class="kicker">FOOD WORLD CUP · ROUND OF 128</div>
        <h1>오늘 뭐 먹지?<br>음식 이상형 월드컵</h1>
        <p>128가지 음식 중 매 라운드 딱 하나만 고르세요. 비슷한 음식끼리 초반에 몰리지 않도록 균형 있게 짠 128강 대진에서 당신의 최종 1위를 찾아봅니다.</p>
        <div class="actions">
          <button class="btn btn-primary" id="startBtn">${state.history.length ? "이어하기" : "128강 시작하기"}</button>
          ${state.history.length ? `<button class="btn btn-secondary" id="resetBtn">처음부터</button>` : ""}
        </div>
        <div class="rules">
          <div class="rule"><strong>128개 대표 메뉴</strong><span class="tiny">피자·과일처럼 같은 계열은 대표 메뉴로 통합</span></div>
          <div class="rule"><strong>균형 대진</strong><span class="tiny">같은 체급끼리, 유사군은 분리해 첫 라운드 구성</span></div>
          <div class="rule"><strong>64번의 선택</strong><span class="tiny">128강을 통과하면 이후는 승자끼리 자연 대결</span></div>
        </div>
      </section>
    </div>`;
  }

  function renderGame(){
    const pair=state.round[state.matchIndex];
    const done=state.matchIndex;
    const total=state.round.length;
    const pct=(done/total)*100;
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
      <p class="match-sub">고민은 짧게. 지금 더 끌리는 쪽을 고르세요.</p>
      <section class="arena">
        ${foodCard(pair[0])}
        <div class="vs">VS</div>
        ${foodCard(pair[1])}
      </section>
      <div class="bottom-tools">
        <button class="btn btn-secondary" id="undoBtn" ${state.history.length ? "" : "disabled"}>↶ 이전 선택</button>
        <span class="tiny">PC에서는 ← / → 키로도 선택할 수 있어요.</span>
      </div>
    </div>`;
  }

  function renderResult(){
    const f=foodMap.get(state.champion);
    const recent=state.history.slice(-8).reverse();
    return `<div class="shell result">
      <section class="result-card">
        <div class="crown">🏆</div>
        <div class="kicker">YOUR NO.1 FOOD</div>
        <div class="emoji">${emojiFor(f.name)}</div>
        <h1>${f.name}</h1>
        <div class="meta">
          <span class="chip">${f.category}</span>
          <span class="chip">${f.taste}</span>
          <span class="chip">${f.region}</span>
        </div>
        <p>128가지 음식 끝에 남은 당신의 최종 선택입니다.<br><strong>${f.name}</strong>이 오늘의 음식 이상형 1위!</p>
        <div class="actions">
          <button class="btn btn-primary" id="resetBtn">다시 하기</button>
          <button class="btn btn-secondary" id="copyBtn">결과 복사</button>
        </div>
        <details class="history-list">
          <summary>마지막 선택 기록 보기</summary>
          <ol>${recent.map(h=>`<li>${roundLabel(h.round)} · ${foodMap.get(h.winner).name} 승</li>`).join("")}</ol>
        </details>
      </section>
    </div>`;
  }

  function bind(){
    document.getElementById("startBtn")?.addEventListener("click", start);
    document.getElementById("resetBtn")?.addEventListener("click", reset);
    document.getElementById("undoBtn")?.addEventListener("click", undo);
    document.querySelectorAll("[data-pick]").forEach(el=>el.addEventListener("click",()=>selectWinner(el.dataset.pick)));
    document.getElementById("copyBtn")?.addEventListener("click", async ()=>{
      const name=foodMap.get(state.champion).name;
      const text=`내 음식 이상형 월드컵 1위는 ${name}! 🏆`;
      try { await navigator.clipboard.writeText(text); alert("결과를 복사했어요."); }
      catch(e){ prompt("아래 문장을 복사하세요.",text); }
    });
  }

  function render(){
    const app=document.getElementById("app");
    app.innerHTML = state.champion ? renderResult() : (!state.started ? renderStart() : renderGame());
    bind();
  }

  window.addEventListener("keydown",(e)=>{
    if(!state.started || state.champion) return;
    if(e.key==="ArrowLeft") selectWinner(state.round[state.matchIndex][0]);
    if(e.key==="ArrowRight") selectWinner(state.round[state.matchIndex][1]);
  });

  render();
})();
