
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
    return `<div class="food-card" data-pick="${food.id}" role="button" tabindex="0" aria-label="${food.name} 선택">
      ${renderVisual(food)}
      <h2 class="food-name">${food.name}</h2>
      ${chips(food)}
      <div class="card-actions">
        <button class="info-btn" data-info="${food.id}" type="button">음식 설명 보기</button>
      </div>
      <div class="pick-note">카드 전체를 누르면 이 음식이 선택돼요</div>
    </div>`;
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


  const TASTE_TRAITS = ["매콤","감칠맛","고소","달콤","새콤","담백","짭짤","진한맛","부드러움","시원","향신료","바삭","크리미","불향"];
  const TRAIT_LABEL = {
    "매콤":"매콤함","감칠맛":"감칠맛","고소":"고소함","달콤":"달콤함","새콤":"산뜻한 새콤함",
    "담백":"담백함","짭짤":"짭짤함","진한맛":"진한 풍미","부드러움":"부드러움","시원":"시원함",
    "향신료":"향신료 풍미","바삭":"바삭한 식감","크리미":"크리미함","불향":"불향"
  };

  function tokens(text){
    return String(text || "")
      .split(/[·,/]/)
      .map(x => x.trim())
      .filter(Boolean);
  }

  // "기회가 있었을 때 실제로 그 특징을 골랐는가"를 계산.
  function pairwiseTraitStats(){
    const stats = new Map();

    function ensure(key, group, label){
      if(!stats.has(key)) stats.set(key, {key, group, label, win:0, opportunity:0});
      return stats.get(key);
    }

    state.history.forEach(h => {
      const w = foodMap.get(h.winner);
      const l = foodMap.get(h.loser);
      if(!w || !l) return;

      // Taste traits
      TASTE_TRAITS.forEach(t => {
        const wt = tokens(w.taste).includes(t);
        const lt = tokens(l.taste).includes(t);
        if(wt !== lt){
          const s = ensure("taste:"+t, "맛", TRAIT_LABEL[t] || t);
          s.opportunity += 1;
          if(wt) s.win += 1;
        }
      });

      // Cooking method, category, region and class — only meaningful pairwise contrasts
      [
        ["조리법", "cook:", w.cooking, l.cooking],
        ["음식형태", "type:", w.type, l.type],
        ["카테고리", "cat:", w.category, l.category],
        ["권역", "region:", w.region, l.region],
      ].forEach(([group,prefix,wv,lv]) => {
        if(wv && lv && wv !== lv){
          const sw = ensure(prefix+wv, group, wv);
          sw.opportunity += 1; sw.win += 1;
          const sl = ensure(prefix+lv, group, lv);
          sl.opportunity += 1;
        }
      });
    });

    return [...stats.values()].map(s => ({
      ...s,
      rate: s.opportunity ? Math.round(s.win / s.opportunity * 100) : 0
    }));
  }

  function tasteProfile(){
    const stats = pairwiseTraitStats()
      .filter(x => x.group === "맛" && x.opportunity >= 3)
      .sort((a,b) => (b.rate - a.rate) || (b.opportunity - a.opportunity));

    // Always show up to 5, fall back to traits with 1+ opportunities.
    if(stats.length >= 5) return stats.slice(0,5);
    const fallback = pairwiseTraitStats()
      .filter(x => x.group === "맛" && x.opportunity >= 1 && !stats.some(y => y.key === x.key))
      .sort((a,b) => (b.rate - a.rate) || (b.opportunity - a.opportunity));
    return [...stats, ...fallback].slice(0,5);
  }

  function categoryProfile(){
    return pairwiseTraitStats()
      .filter(x => x.group === "카테고리" && x.opportunity >= 2)
      .sort((a,b) => (b.rate - a.rate) || (b.opportunity - a.opportunity));
  }

  function buildCharacterLine(){
    const tastes = tasteProfile();
    const cats = categoryProfile();
    const t1 = tastes[0]?.label || "익숙한 맛";
    const t2 = tastes[1]?.label || "든든한 한 끼";
    const c1 = cats[0]?.label?.replace("·"," ") || "";
    if(c1) return `${t1}은 확실하게, ${t2}도 놓치지 않는 ${c1} 취향`;
    return `${t1}을 중심으로 ${t2}까지 챙기는 선명한 입맛`;
  }

  function buildWhyText(champion){
    const tastes = tasteProfile().slice(0,3);
    const tasteText = tastes.map(x => x.label).join(", ");
    const selectedSameCategory = state.history.filter(h => foodMap.get(h.winner)?.category === champion.category).length;
    const total = Math.max(state.history.length,1);
    const catRate = Math.round(selectedSameCategory / total * 100);

    return `${champion.name}이 마지막까지 남은 건 우연만은 아니에요. 대결 기록을 보면 ${tasteText || champion.taste}처럼 ${champion.name}이 가진 맛의 방향을 반복해서 선택했고, ${champion.category} 계열도 전체 선택 중 약 ${catRate}%에서 승자로 골랐어요. 결승 결과와 앞선 선택 패턴이 같은 방향을 가리키고 있습니다.`;
  }

  function surprisingInsight(){
    const all = pairwiseTraitStats();
    const tastes = all.filter(x => x.group === "맛" && x.opportunity >= 5)
      .sort((a,b) => (b.rate-a.rate) || (b.opportunity-a.opportunity));

    if(tastes.length >= 2){
      const top = tastes[0];
      // Prefer a comparison trait with enough opportunity and a meaningful gap.
      const compare = tastes.slice(1).find(x => top.rate - x.rate >= 8) || tastes[1];
      return {
        headline:`의외로 ${top.label}을 가장 안정적으로 골랐어요.`,
        body:`${top.label}이 있는 음식은 비교 기회 ${top.opportunity}번 중 ${top.win}번 선택했어요(${top.rate}%). ${compare.label}의 선택률 ${compare.rate}%보다 높았습니다. 평소 스스로 생각하는 취향과 실제 선택 패턴이 조금 다를 수도 있어요.`
      };
    }

    const nonTaste = all.filter(x => ["조리법","음식형태"].includes(x.group) && x.opportunity >= 4)
      .sort((a,b) => (b.rate-a.rate) || (b.opportunity-a.opportunity))[0];

    if(nonTaste){
      return {
        headline:`생각보다 ‘${nonTaste.label}’ 스타일을 자주 골랐어요.`,
        body:`${nonTaste.label}이 다른 방식과 맞붙은 ${nonTaste.opportunity}번의 선택에서 ${nonTaste.win}번 이겼어요(${nonTaste.rate}%). 음식 이름보다 조리 방식에서 취향이 더 선명하게 드러난 셈이에요.`
      };
    }

    return {
      headline:"우승 음식보다 반복된 선택 패턴이 더 흥미로워요.",
      body:"결승 한 번의 선택보다 앞선 대결에서 반복해서 고른 맛과 조리 방식이 실제 취향을 더 잘 보여줍니다."
    };
  }

  function featurePreferenceMap(){
    const stats = pairwiseTraitStats();
    return new Map(stats.map(s => [s.key, s]));
  }

  function recommendationScore(food, pref){
    let score = 0;
    let weight = 0;

    tokens(food.taste).forEach(t => {
      const s = pref.get("taste:"+t);
      if(s && s.opportunity >= 2){ score += s.rate * 2.2; weight += 2.2; }
    });

    const cat = pref.get("cat:"+food.category);
    if(cat && cat.opportunity >= 2){ score += cat.rate * 1.2; weight += 1.2; }

    const cook = pref.get("cook:"+food.cooking);
    if(cook && cook.opportunity >= 2){ score += cook.rate * .8; weight += .8; }

    const type = pref.get("type:"+food.type);
    if(type && type.opportunity >= 2){ score += type.rate * .6; weight += .6; }

    return weight ? score / weight : 50;
  }

  function todayRecommendations(champion){
    const pref = featurePreferenceMap();
    const selectedIds = new Set(state.history.map(h => h.winner));

    // Prefer foods user has already shown some interest in, but allow new close fits too.
    return window.FOOD_DB
      .filter(f => f.id !== champion.id)
      .map(f => {
        let score = recommendationScore(f, pref);
        if(selectedIds.has(f.id)) score += 5;
        if(f.category === champion.category) score += 3;
        return {food:f, score};
      })
      .sort((a,b) => b.score-a.score)
      .slice(0,3);
  }

  function preferenceBars(){
    const list = tasteProfile();
    if(!list.length) return `<p class="empty-analysis">선택 기록이 더 쌓이면 세부 취향을 보여드릴게요.</p>`;
    return `<div class="pref-bars">
      ${list.map((x,i) => `
        <div class="pref-row">
          <div class="pref-label"><span>${x.label}</span><strong>${x.rate}</strong></div>
          <div class="pref-track"><span style="width:${Math.max(4,x.rate)}%"></span></div>
          <div class="pref-caption">비교 ${x.opportunity}회 · 선택 ${x.win}회</div>
        </div>
      `).join("")}
    </div>`;
  }

  function recCard(item, index){
    const f = item.food;
    return `<button class="today-rec-card" data-info="${f.id}" type="button">
      <span class="rec-rank">${index+1}</span>
      <span class="rec-icon">${iconFor(f.name)}</span>
      <span class="rec-copy">
        <strong>${f.name}</strong>
        <small>${f.taste} · ${f.category}</small>
      </span>
      <span class="rec-arrow">→</span>
    </button>`;
  }


  function topFiveFoods(){
    const wins = new Map();
    const eliminatedRound = new Map();

    state.history.forEach(h => {
      wins.set(h.winner, (wins.get(h.winner) || 0) + 1);
      // Higher round number = earlier elimination. Lower number = survived longer.
      eliminatedRound.set(h.loser, h.round);
    });

    if(state.champion) eliminatedRound.set(state.champion, 1);

    const pref = featurePreferenceMap();

    return window.FOOD_DB
      .map(f => ({
        food:f,
        wins:wins.get(f.id) || 0,
        survived: eliminatedRound.get(f.id) || 999,
        prefScore: recommendationScore(f, pref)
      }))
      .filter(x => x.wins > 0 || x.food.id === state.champion)
      .sort((a,b) =>
        (b.wins - a.wins) ||
        (a.survived - b.survived) ||
        (b.prefScore - a.prefScore)
      )
      .slice(0,5);
  }

  function shareData(){
    const champion = foodMap.get(state.champion);
    const best5 = topFiveFoods();
    const tastes = tasteProfile().slice(0,3);
    const recs = todayRecommendations(champion).slice(0,3);
    const insight = surprisingInsight();
    const character = buildCharacterLine();

    return {
      champion,
      best5,
      tastes,
      recs,
      insight,
      character
    };
  }

  function buildSharePayload(){
    const d = shareData();
    return {
      v: 1,
      character: d.character,
      champion: {
        name: d.champion.name,
        category: d.champion.category,
        taste: d.champion.taste,
        region: d.champion.region
      },
      best5: d.best5.map(x => ({ name: x.food.name })),
      tastes: d.tastes.map(x => ({ label: x.label, rate: x.rate })),
      recs: d.recs.map(x => ({ name: x.food.name, taste: x.food.taste, category: x.food.category })),
      insight: {
        headline: d.insight.headline,
        body: d.insight.body
      }
    };
  }

  function encodeBase64Url(str){
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  function decodeBase64Url(str){
    const normalized = str.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "===".slice((normalized.length + 3) % 4);
    return decodeURIComponent(escape(atob(padded)));
  }

  function encodeShareToken(payload){
    return encodeBase64Url(JSON.stringify(payload));
  }

  function decodeShareToken(token){
    try{
      return JSON.parse(decodeBase64Url(token));
    }catch(e){
      return null;
    }
  }

  function buildResultShareUrl(){
    const token = encodeShareToken(buildSharePayload());
    return `${location.origin}/result/${token}`;
  }

  function shareText(url = buildResultShareUrl()){
    const d = shareData();
    const tasteLine = d.tastes.length
      ? d.tastes.map(x => `${x.label} ${x.rate}%`).join(" · ")
      : d.champion.taste;

    return [
      "🍽️ 음식 이상형 월드컵 결과",
      "",
      `🏆 내 최애 음식: ${d.champion.name}`,
      "",
      "❤️ 내가 가장 좋아하는 음식 BEST 5",
      ...d.best5.map((x,i) => `${i+1}. ${x.food.name}`),
      "",
      "😋 내가 좋아하는 맛은?",
      tasteLine,
      "",
      "🌙 오늘 저녁 메뉴 추천",
      ...d.recs.map((x,i) => `${i+1}. ${x.food.name}`),
      "",
      "🔗 내 결과 링크",
      url,
      "",
      "오늘 뭐 먹지? 음식 이상형 월드컵"
    ].join("\n");
  }

  function shareResultLink(){
    const url = buildResultShareUrl();

    // KakaoTalk link-card preview is most reliable when the message contains
    // the URL by itself. Copy only the URL so the user can paste it into Kakao.
    return navigator.clipboard.writeText(url)
      .then(() => alert("개인 결과 링크를 복사했어요. 카카오톡에 링크만 그대로 붙여넣으세요."))
      .catch(() => prompt("아래 링크만 복사해서 카카오톡에 붙여넣으세요.", url));
  }

  function copyResultLink(){
    const url = buildResultShareUrl();
    return navigator.clipboard.writeText(url)
      .then(() => alert("개인 결과 링크를 복사했어요."))
      .catch(() => prompt("아래 링크를 복사하세요.", url));
  }



  function sharedRecCard(item, index){
    return `<div class="today-rec-card shared-rec-card">
      <span class="rec-rank">${index+1}</span>
      <span class="rec-icon">${iconFor(item.name)}</span>
      <span class="rec-copy">
        <strong>${item.name}</strong>
        <small>${item.taste} · ${item.category}</small>
      </span>
    </div>`;
  }

  function renderSharedResultView(payload){
    const champion = payload.champion;
    const tastes = payload.tastes || [];
    const recs = payload.recs || [];
    const best5 = payload.best5 || [];
    const insight = payload.insight || { headline:"", body:"" };
    return `<div class="shell result-page shared-result-page">
      <header class="brand result-brand">
        <div class="logo">오늘 뭐 먹지? <b>WORLD CUP</b></div>
        <button class="btn btn-primary" id="playFromSharedBtn">나도 해보기</button>
      </header>

      <section class="winner-hero">
        <div class="winner-kicker">🔗 공유된 결과</div>
        <div class="food-visual shared-visual"><div class="food-art"><div class="food-plate"></div><div class="food-icon">${iconFor(champion.name)}</div></div></div>
        <h1>${champion.name}</h1>
        <div class="meta">
          <span class="chip">${champion.category}</span>
          <span class="chip">${champion.taste}</span>
          <span class="chip">${champion.region}</span>
        </div>
        <p class="taste-character">${payload.character || ""}</p>
      </section>

      <section class="analysis-card">
        <div class="analysis-card-head">
          <div>
            <span class="eyebrow">SHARED RESULT</span>
            <h2>이 사람이 좋아한 음식 TOP 5</h2>
          </div>
        </div>
        <div class="shared-best5">
          ${best5.map((x,i)=>`<div class="shared-best5-item"><span class="shared-best5-rank">${i+1}</span><span class="shared-best5-icon">${iconFor(x.name)}</span><strong>${x.name}</strong></div>`).join("")}
        </div>
      </section>

      <section class="analysis-card">
        <div class="analysis-card-head">
          <div>
            <span class="eyebrow">TOP TASTES</span>
            <h2>좋아하는 맛</h2>
          </div>
        </div>
        <div class="pref-bars">
          ${tastes.map(x => `
            <div class="pref-row">
              <div class="pref-label"><span>${x.label}</span><strong>${x.rate}</strong></div>
              <div class="pref-track"><span style="width:${Math.max(4,x.rate)}%"></span></div>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="insight-card">
        <span class="insight-label">뜻밖의 발견</span>
        <h2>${insight.headline}</h2>
        <p>${insight.body}</p>
      </section>

      <section class="today-section">
        <div class="today-head">
          <div>
            <span class="eyebrow">DINNER RECOMMENDATION</span>
            <h2>오늘 저녁 메뉴 추천</h2>
          </div>
        </div>
        <div class="today-recs">
          ${recs.map((x,i)=>sharedRecCard(x,i)).join("")}
        </div>
      </section>

      <div class="result-actions">
        <button class="btn btn-primary" id="playFromSharedBtnBottom">나도 128강 해보기</button>
      </div>
    </div>`;
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines){
    const words = String(text).split(" ");
    let line = "";
    let lines = [];
    for(const w of words){
      const test = line ? line + " " + w : w;
      if(ctx.measureText(test).width > maxWidth && line){
        lines.push(line);
        line = w;
      }else{
        line = test;
      }
    }
    if(line) lines.push(line);
    if(maxLines && lines.length > maxLines){
      lines = lines.slice(0, maxLines);
      let last = lines[maxLines - 1];
      while(ctx.measureText(last + "…").width > maxWidth && last.length > 0){
        last = last.slice(0, -1);
      }
      lines[maxLines - 1] = last + "…";
    }
    lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * lineHeight));
  }

  function roundedRect(ctx, x, y, w, h, r, fill, stroke){
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
    if(fill){ ctx.fillStyle = fill; ctx.fill(); }
    if(stroke){ ctx.strokeStyle = stroke; ctx.stroke(); }
  }


  let shareFormat = "feed";

  function drawRoundedRect(ctx, x, y, w, h, r, fill, stroke, lineWidth=1){
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
    if(fill){ ctx.fillStyle = fill; ctx.fill(); }
    if(stroke){ ctx.lineWidth = lineWidth; ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  function canvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines=2){
    const chars = String(text).split("");
    let line = "";
    const lines = [];
    for(const ch of chars){
      const test = line + ch;
      if(ctx.measureText(test).width > maxWidth && line){
        lines.push(line);
        line = ch;
      }else{
        line = test;
      }
    }
    if(line) lines.push(line);

    const safe = lines.slice(0,maxLines);
    if(lines.length > maxLines){
      let last = safe[maxLines-1];
      while(ctx.measureText(last+"…").width > maxWidth && last.length) last = last.slice(0,-1);
      safe[maxLines-1] = last+"…";
    }
    safe.forEach((ln,i)=>ctx.fillText(ln,x,y+i*lineHeight));
    return safe.length;
  }

  function cardTheme(){
    return {
      bg:"#F5EFE7",
      paper:"#FFFDF9",
      ink:"#241D19",
      muted:"#75675E",
      line:"#E4D7CA",
      accent:"#D45B22",
      accentSoft:"#FBE8D9",
      dark:"#2E241F",
      gold:"#D9A441"
    };
  }

  async function makeShareCardBlob(format = shareFormat){
    const d = shareData();
    const isStory = format === "story";
    const W = 1080;
    const H = isStory ? 1920 : 1350;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const C = cardTheme();

    // Base background
    ctx.fillStyle = C.bg;
    ctx.fillRect(0,0,W,H);

    // Decorative glows
    const glow1 = ctx.createRadialGradient(120,80,0,120,80,340);
    glow1.addColorStop(0,"rgba(244,172,112,.35)");
    glow1.addColorStop(1,"rgba(244,172,112,0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0,0,520,520);

    const glow2 = ctx.createRadialGradient(1000,120,0,1000,120,300);
    glow2.addColorStop(0,"rgba(244,213,134,.28)");
    glow2.addColorStop(1,"rgba(244,213,134,0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(650,0,430,430);

    // Main outer card
    const margin = 54;
    drawRoundedRect(ctx, margin, 54, W-margin*2, H-108, 44, C.paper, C.line, 2);

    // Header
    ctx.fillStyle = C.ink;
    ctx.font = "900 34px Pretendard, Apple SD Gothic Neo, sans-serif";
    ctx.fillText("오늘 뭐 먹지?", 92, 110);
    ctx.fillStyle = C.accent;
    ctx.font = "900 27px Pretendard, Apple SD Gothic Neo, sans-serif";
    ctx.fillText("WORLD CUP", 294, 109);

    drawRoundedRect(ctx, 828, 78, 160, 44, 22, C.accentSoft, null);
    ctx.fillStyle = C.accent;
    ctx.font = "900 19px Pretendard, Apple SD Gothic Neo, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MY TASTE CARD", 908, 107);
    ctx.textAlign = "left";

    // Hero
    const heroY = 150;
    drawRoundedRect(ctx, 92, heroY, 896, isStory ? 340 : 286, 34, "#FFF8F2", "#EEDAC9");

    ctx.fillStyle = C.accent;
    ctx.font = "900 20px Pretendard, Apple SD Gothic Neo, sans-serif";
    ctx.fillText("🏆 128강 최종 우승", 126, heroY+46);

    ctx.font = "900 110px Apple Color Emoji, Segoe UI Emoji, sans-serif";
    ctx.fillText(iconFor(d.champion.name), 126, heroY+178);

    ctx.fillStyle = C.ink;
    ctx.font = "900 72px Pretendard, Apple SD Gothic Neo, sans-serif";
    ctx.fillText(d.champion.name, 310, heroY+128);

    ctx.fillStyle = C.muted;
    ctx.font = "800 24px Pretendard, Apple SD Gothic Neo, sans-serif";
    canvasText(ctx, buildCharacterLine(), 312, heroY+177, 600, 34, 2);

    // Hero chips
    const chips = [d.champion.category, d.champion.taste, d.champion.region];
    ctx.font = "800 18px Pretendard, Apple SD Gothic Neo, sans-serif";
    let chipX = 312;
    chips.forEach(ch => {
      const w = ctx.measureText(ch).width + 30;
      drawRoundedRect(ctx, chipX, heroY+216, w, 38, 19, "#FFFFFF", "#EBD8C8");
      ctx.fillStyle = "#755F50";
      ctx.fillText(ch, chipX+15, heroY+241);
      chipX += w + 9;
    });

    // Layout differs by format
    if(!isStory){
      // FEED 4:5 — compact two-column body
      const bodyY = 466;

      // Best 5
      drawRoundedRect(ctx, 92, bodyY, 432, 424, 28, "#FFFFFF", C.line);
      ctx.fillStyle = C.ink;
      ctx.font = "900 28px Pretendard, Apple SD Gothic Neo, sans-serif";
      ctx.fillText("❤️ BEST 5", 120, bodyY+48);

      d.best5.forEach((item, idx) => {
        const y = bodyY+92 + idx*61;
        ctx.fillStyle = idx===0 ? C.accent : "#A78E7C";
        ctx.font = "900 18px Pretendard, Apple SD Gothic Neo, sans-serif";
        ctx.fillText(String(idx+1).padStart(2,"0"), 122, y+7);

        ctx.font = "700 25px Apple Color Emoji, Segoe UI Emoji, sans-serif";
        ctx.fillText(iconFor(item.food.name), 166, y+8);

        ctx.fillStyle = C.ink;
        ctx.font = "800 24px Pretendard, Apple SD Gothic Neo, sans-serif";
        ctx.fillText(item.food.name, 207, y+7);
      });

      // Taste + insight
      drawRoundedRect(ctx, 552, bodyY, 436, 214, 28, "#FFFFFF", C.line);
      ctx.fillStyle = C.ink;
      ctx.font = "900 27px Pretendard, Apple SD Gothic Neo, sans-serif";
      ctx.fillText("😋 좋아하는 맛", 580, bodyY+46);

      d.tastes.slice(0,3).forEach((t, idx)=>{
        const y = bodyY+86+idx*38;
        ctx.fillStyle = C.muted;
        ctx.font = "800 19px Pretendard, Apple SD Gothic Neo, sans-serif";
        ctx.fillText(t.label, 580, y);
        drawRoundedRect(ctx, 728, y-16, 180, 12, 6, "#EFE5DD", null);
        drawRoundedRect(ctx, 728, y-16, Math.max(14,180*t.rate/100), 12, 6, C.accent, null);
        ctx.fillStyle = C.accent;
        ctx.font = "900 18px Pretendard, Apple SD Gothic Neo, sans-serif";
        ctx.fillText(`${t.rate}%`, 920, y);
      });

      drawRoundedRect(ctx, 552, bodyY+236, 436, 188, 28, C.dark, null);
      ctx.fillStyle = C.gold;
      ctx.font = "900 18px Pretendard, Apple SD Gothic Neo, sans-serif";
      ctx.fillText("🔎 뜻밖의 발견", 580, bodyY+276);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 24px Pretendard, Apple SD Gothic Neo, sans-serif";
      canvasText(ctx, surprisingInsight().headline, 580, bodyY+318, 350, 32, 2);
      ctx.fillStyle = "rgba(255,255,255,.72)";
      ctx.font = "700 17px Pretendard, Apple SD Gothic Neo, sans-serif";
      canvasText(ctx, surprisingInsight().body, 580, bodyY+382, 350, 25, 2);

      // Dinner
      const dinnerY = 916;
      ctx.fillStyle = C.accent;
      ctx.font = "900 18px Pretendard, Apple SD Gothic Neo, sans-serif";
      ctx.fillText("SO, WHAT SHOULD I EAT TODAY?", 92, dinnerY);
      ctx.fillStyle = C.ink;
      ctx.font = "900 33px Pretendard, Apple SD Gothic Neo, sans-serif";
      ctx.fillText("🌙 오늘 저녁 메뉴 추천", 92, dinnerY+42);

      d.recs.slice(0,3).forEach((item, idx)=>{
        const x = 92 + idx*302;
        drawRoundedRect(ctx, x, dinnerY+72, 282, 178, 24, "#FFF8F2", "#ECDACB");
        ctx.font = "900 54px Apple Color Emoji, Segoe UI Emoji, sans-serif";
        ctx.fillText(iconFor(item.food.name), x+24, dinnerY+137);
        ctx.fillStyle = C.ink;
        ctx.font = "900 26px Pretendard, Apple SD Gothic Neo, sans-serif";
        canvasText(ctx, item.food.name, x+95, dinnerY+119, 160, 30, 2);
        ctx.fillStyle = C.muted;
        ctx.font = "700 16px Pretendard, Apple SD Gothic Neo, sans-serif";
        canvasText(ctx, item.food.taste, x+24, dinnerY+165, 225, 22, 2);
      });

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "700 17px Pretendard, Apple SD Gothic Neo, sans-serif";
      ctx.fillText("127번의 실제 선택 기록으로 만든 나만의 음식 취향 카드", 92, 1280);

    }else{
      // STORY 9:16 — spacious vertical layout
      const y0 = 530;

      drawRoundedRect(ctx, 92, y0, 896, 330, 30, "#FFFFFF", C.line);
      ctx.fillStyle = C.ink;
      ctx.font = "900 31px Pretendard, Apple SD Gothic Neo, sans-serif";
      ctx.fillText("❤️ 내가 가장 좋아하는 음식 BEST 5", 126, y0+52);

      d.best5.forEach((item, idx)=>{
        const y = y0+105+idx*44;
        ctx.fillStyle = idx===0 ? C.accent : "#A58B79";
        ctx.font = "900 17px Pretendard, Apple SD Gothic Neo, sans-serif";
        ctx.fillText(String(idx+1).padStart(2,"0"), 128, y);
        ctx.font = "700 24px Apple Color Emoji, Segoe UI Emoji, sans-serif";
        ctx.fillText(iconFor(item.food.name), 176, y+1);
        ctx.fillStyle = C.ink;
        ctx.font = "800 23px Pretendard, Apple SD Gothic Neo, sans-serif";
        ctx.fillText(item.food.name, 220, y);
      });

      drawRoundedRect(ctx, 92, 890, 896, 248, 30, "#FFFFFF", C.line);
      ctx.fillStyle = C.ink;
      ctx.font = "900 30px Pretendard, Apple SD Gothic Neo, sans-serif";
      ctx.fillText("😋 내가 좋아하는 맛", 126, 940);

      d.tastes.slice(0,3).forEach((t, idx)=>{
        const y=995+idx*45;
        ctx.fillStyle=C.muted;
        ctx.font="800 20px Pretendard, Apple SD Gothic Neo, sans-serif";
        ctx.fillText(t.label,126,y);
        drawRoundedRect(ctx, 335, y-17, 470, 14, 7, "#EFE5DD", null);
        drawRoundedRect(ctx, 335, y-17, Math.max(18,470*t.rate/100), 14, 7, C.accent, null);
        ctx.fillStyle=C.accent;
        ctx.font="900 20px Pretendard, Apple SD Gothic Neo, sans-serif";
        ctx.fillText(`${t.rate}%`, 835, y);
      });

      drawRoundedRect(ctx, 92, 1170, 896, 258, 30, C.dark, null);
      ctx.fillStyle=C.gold;
      ctx.font="900 19px Pretendard, Apple SD Gothic Neo, sans-serif";
      ctx.fillText("🔎 뜻밖의 발견",126,1222);
      ctx.fillStyle="#fff";
      ctx.font="900 28px Pretendard, Apple SD Gothic Neo, sans-serif";
      canvasText(ctx,surprisingInsight().headline,126,1268,790,38,2);
      ctx.fillStyle="rgba(255,255,255,.74)";
      ctx.font="700 19px Pretendard, Apple SD Gothic Neo, sans-serif";
      canvasText(ctx,surprisingInsight().body,126,1350,790,28,3);

      ctx.fillStyle=C.accent;
      ctx.font="900 18px Pretendard, Apple SD Gothic Neo, sans-serif";
      ctx.fillText("SO, WHAT SHOULD I EAT TODAY?",92,1494);
      ctx.fillStyle=C.ink;
      ctx.font="900 34px Pretendard, Apple SD Gothic Neo, sans-serif";
      ctx.fillText("🌙 오늘 저녁 메뉴 추천",92,1536);

      d.recs.slice(0,3).forEach((item, idx)=>{
        const x=92+idx*302;
        drawRoundedRect(ctx,x,1576,282,176,24,"#FFF8F2","#ECDACB");
        ctx.font="900 54px Apple Color Emoji, Segoe UI Emoji, sans-serif";
        ctx.fillText(iconFor(item.food.name),x+24,1642);
        ctx.fillStyle=C.ink;
        ctx.font="900 25px Pretendard, Apple SD Gothic Neo, sans-serif";
        canvasText(ctx,item.food.name,x+96,1628,150,30,2);
        ctx.fillStyle=C.muted;
        ctx.font="700 16px Pretendard, Apple SD Gothic Neo, sans-serif";
        canvasText(ctx,item.food.taste,x+24,1703,225,22,2);
      });

      ctx.fillStyle=C.muted;
      ctx.font="700 18px Pretendard, Apple SD Gothic Neo, sans-serif";
      ctx.fillText("127번의 실제 선택 기록으로 만든 나만의 음식 취향 카드",92,1820);
    }

    const blob = await new Promise(resolve => canvas.toBlob(resolve,"image/png"));
    return {
      blob,
      dataUrl:canvas.toDataURL("image/png"),
      width:W,
      height:H,
      filename:isStory ? "food-worldcup-story.png" : "food-worldcup-feed.png"
    };
  }

  async function sharePngCard(format = shareFormat){
    const { blob, filename } = await makeShareCardBlob(format);
    const file = new File([blob], filename, {type:"image/png"});
    const text = shareText();

    if(navigator.canShare && navigator.canShare({files:[file]}) && navigator.share){
      try{
        await navigator.share({
          title:"음식 이상형 월드컵 결과",
          text,
          files:[file]
        });
        return;
      }catch(e){
        if(e?.name==="AbortError") return;
      }
    }

    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);

    try{
      await navigator.clipboard.writeText(text);
      alert("PNG 카드를 저장하고 공유 문구도 복사했어요.");
    }catch(e){
      alert("PNG 카드를 저장했어요.");
    }
  }



  function openShareModal(){
    const d = shareData();
    const modal = document.getElementById("foodModal");
    const content = document.getElementById("modalContent");

    content.innerHTML = `
      <div class="share-preview">
        <div class="share-brand">오늘 뭐 먹지? <b>WORLD CUP</b></div>

        <section class="share-winner share-winner-compact">
          <span class="share-mini-label">SHARE YOUR TASTE</span>
          <h2 id="modalTitle">결과 카드 만들기</h2>
          <p>카카오톡·인스타 피드용과 스토리용 중 원하는 비율을 선택하세요.</p>
        </section>

        <div class="share-format-tabs">
          <button class="share-format-tab active" data-share-format="feed" type="button">
            <strong>피드 / 카카오</strong>
            <span>1080 × 1350 · 4:5</span>
          </button>
          <button class="share-format-tab" data-share-format="story" type="button">
            <strong>스토리</strong>
            <span>1080 × 1920 · 9:16</span>
          </button>
        </div>

        <section class="share-image-wrap">
          <div class="share-image-head">
            <strong>공유 카드 미리보기</strong>
            <span id="shareImageSize">1080 × 1350 PNG</span>
          </div>
          <img id="shareImagePreview" class="share-image-preview share-image-feed" alt="공유용 결과 이미지 미리보기" />
        </section>

        <section class="share-link-box">
          <h3>개인 결과 링크 공유</h3>
          <p>카카오톡 미리보기를 위해 <b>결과 URL만 복사</b>합니다. 복사한 링크를 카카오톡에 그대로 붙여넣으세요.</p>
          <input class="share-link-input" id="shareLinkInput" readonly />
        </section>

        <div class="share-modal-actions">
          <button class="btn btn-primary" id="shareImageBtn">이미지 카드 공유하기</button>
          <button class="btn btn-secondary" id="shareLinkBtn">카카오 링크 복사</button>
          <button class="btn btn-secondary" id="copyLinkBtn">링크 복사</button>
          <button class="btn btn-secondary" id="downloadImageBtn">PNG 저장</button>
          <button class="btn btn-secondary" id="copyShareBtn">문구 복사</button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";

    const updatePreview = async () => {
      const img=document.getElementById("shareImagePreview");
      const size=document.getElementById("shareImageSize");
      if(img){
        img.style.opacity=".45";
        const result=await makeShareCardBlob(shareFormat);
        img.src=result.dataUrl;
        img.className=`share-image-preview ${shareFormat==="feed" ? "share-image-feed":"share-image-story"}`;
        img.style.opacity="1";
        if(size) size.textContent=`${result.width} × ${result.height} PNG`;
      }
    };

    updatePreview();

    const shareLinkInput = document.getElementById("shareLinkInput");
    if(shareLinkInput) shareLinkInput.value = buildResultShareUrl();

    document.querySelectorAll("[data-share-format]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        shareFormat=btn.dataset.shareFormat;
        document.querySelectorAll("[data-share-format]").forEach(x=>x.classList.toggle("active",x===btn));
        updatePreview();
      });
    });

    document.getElementById("shareImageBtn")?.addEventListener("click",()=>sharePngCard(shareFormat));
    document.getElementById("shareLinkBtn")?.addEventListener("click",shareResultLink);
    document.getElementById("copyLinkBtn")?.addEventListener("click",copyResultLink);

    document.getElementById("downloadImageBtn")?.addEventListener("click",async()=>{
      const {blob,filename}=await makeShareCardBlob(shareFormat);
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;a.download=filename;
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    });

    document.getElementById("copyShareBtn")?.addEventListener("click",async()=>{
      const text=shareText();
      try{await navigator.clipboard.writeText(text);alert("공유 문구를 복사했어요.");}
      catch(e){prompt("아래 결과를 복사하세요.",text);}
    });
  }

  function renderResult(){
    const food = foodMap.get(state.champion);
    const insight = surprisingInsight();
    const recs = todayRecommendations(food);
    const charLine = buildCharacterLine();
    const why = buildWhyText(food);

    return `<div class="shell result-page">
      <header class="brand result-brand">
        <div class="logo">오늘 뭐 먹지? <b>WORLD CUP</b></div>
        <button class="btn btn-ghost" id="resetBtn">다시 하기</button>
      </header>

      <section class="winner-hero">
        <div class="winner-kicker">🏆 128강 최종 우승</div>
        ${renderVisual(food)}
        <h1>${food.name}</h1>
        ${chips(food)}
        <p class="taste-character">${charLine}</p>
      </section>

      <section class="analysis-section">
        <div class="section-number">01</div>
        <div class="section-copy">
          <h2>왜 이런 결과가 나왔을까요?</h2>
          <p>${why}</p>
        </div>
      </section>

      <section class="analysis-card">
        <div class="analysis-card-head">
          <div>
            <span class="eyebrow">MY TASTE PROFILE</span>
            <h2>선택으로 드러난 세부 취향</h2>
          </div>
          <span class="analysis-note">127번의 선택 기록 기반</span>
        </div>
        ${preferenceBars()}
      </section>

      <section class="insight-card">
        <span class="insight-label">뜻밖의 발견</span>
        <h2>${insight.headline}</h2>
        <p>${insight.body}</p>
      </section>

      <section class="today-section">
        <div class="today-head">
          <div>
            <span class="eyebrow">SO, WHAT SHOULD I EAT TODAY?</span>
            <h2>그래서 오늘 뭐 먹지?</h2>
            <p>월드컵에서 드러난 취향을 기준으로 오늘 끌릴 가능성이 높은 메뉴를 골랐어요.</p>
          </div>
        </div>
        <div class="today-recs">
          ${recs.map((x,i) => recCard(x,i)).join("")}
        </div>
      </section>

      <div class="result-actions">
        <button class="btn btn-primary" id="shareResultBtn">결과 공유하기</button>
        <button class="btn btn-secondary" id="winnerInfoBtn">우승 음식 설명 보기</button>
        <button class="btn btn-secondary" id="resetBtnBottom">다시 해보기</button>
      </div>

      <div class="footer-note">분석은 이번 월드컵의 실제 선택 기록을 바탕으로 계산합니다.</div>
    </div>`;
  }

  function bind(){
    document.getElementById("startBtn")?.addEventListener("click", start);
    document.getElementById("playFromSharedBtn")?.addEventListener("click", () => location.href = "/");
    document.getElementById("playFromSharedBtnBottom")?.addEventListener("click", () => location.href = "/");
    document.getElementById("resetBtn")?.addEventListener("click", reset);
    document.getElementById("resetBtnBottom")?.addEventListener("click", reset);
    document.getElementById("undoBtn")?.addEventListener("click", undo);
    document.querySelectorAll("[data-pick]").forEach(card => {
      card.addEventListener("click", () => selectWinner(card.dataset.pick));
      card.addEventListener("keydown", (e) => {
        if(e.key === "Enter" || e.key === " "){
          e.preventDefault();
          selectWinner(card.dataset.pick);
        }
      });
    });
    document.querySelectorAll("[data-info]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(btn.dataset.info);
      });
    });
    document.getElementById("winnerInfoBtn")?.addEventListener("click", () => openModal(state.champion));
    document.getElementById("shareResultBtn")?.addEventListener("click", openShareModal);
    document.getElementById("modalCloseBtn")?.addEventListener("click", closeModal);
    document.querySelectorAll("[data-close-modal='true']").forEach(el => el.addEventListener("click", closeModal));
  }

  function render(){
    const app = document.getElementById("app");
    const shareToken = new URLSearchParams(location.search).get("share");
    const sharedPayload = shareToken ? decodeShareToken(shareToken) : null;

    if(sharedPayload && sharedPayload.champion){
      app.innerHTML = renderSharedResultView(sharedPayload);
    }else{
      app.innerHTML = state.champion ? renderResult() : (!state.started ? renderStart() : renderGame());
    }
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
