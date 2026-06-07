const questions = [
  {
    claim: "只要網址開頭有 https，就代表這個網站一定安全、一定不是詐騙。",
    answer: false,
    topic: "釣魚網站",
    level: "初階",
    fact: "HTTPS 只能代表連線有加密，不能保證網站經營者可信。仍要檢查網域、內容與登入要求。"
  },
  {
    claim: "收到要求立刻付款、重設密碼或提供驗證碼的訊息時，應先改用官方管道查證。",
    answer: true,
    topic: "社交工程",
    level: "初階",
    fact: "正確。緊迫感是常見詐騙手法，改用官方 App、官網或已知電話查證能降低風險。"
  },
  {
    claim: "密碼只要夠長，就可以在所有服務重複使用。",
    answer: false,
    topic: "密碼安全",
    level: "初階",
    fact: "重複使用密碼會讓單一外洩變成連鎖災害。建議使用密碼管理器，並為重要服務開啟多因素驗證。"
  },
  {
    claim: "公開 Wi-Fi 不適合登入重要帳號，尤其是沒有 VPN 或行動網路替代方案時。",
    answer: true,
    topic: "網路連線",
    level: "中階",
    fact: "正確。公開 Wi-Fi 可能被竊聽或偽造，重要操作可改用行動網路、VPN，並確認網站與 App 來源。"
  },
  {
    claim: "防毒軟體裝了以後，就不用再更新系統與瀏覽器。",
    answer: false,
    topic: "系統更新",
    level: "初階",
    fact: "防毒不是萬能盾牌。系統與瀏覽器更新會修補已知漏洞，是基本防線。"
  },
  {
    claim: "掃描 QR Code 前要先看來源，打開後也要檢查網址是否合理。",
    answer: true,
    topic: "QR Code",
    level: "初階",
    fact: "正確。QR Code 可能導向假登入頁、惡意下載或付款頁，來源與網址都需要查證。"
  },
  {
    claim: "朋友帳號傳來借錢訊息，因為是熟人帳號，所以可以直接轉帳。",
    answer: false,
    topic: "帳號盜用",
    level: "中階",
    fact: "熟人帳號也可能被盜。涉及金錢或個資時，應用電話或面對面等第二管道確認。"
  },
  {
    claim: "重要資料至少要有一份離線或雲端備份，才比較能抵抗勒索軟體與裝置故障。",
    answer: true,
    topic: "備份",
    level: "中階",
    fact: "正確。備份要能復原才算有效，建議定期測試，並避免所有備份長期連在同一台電腦上。"
  },
  {
    claim: "AI 生成的客服、語音或圖片看起來很真，所以可信度比一般訊息更高。",
    answer: false,
    topic: "AI 詐騙",
    level: "進階",
    fact: "AI 讓偽造更逼真，不代表更可信。越像真的，越要回到來源、流程與第二管道查證。"
  },
  {
    claim: "分享個資前，先問清楚用途、必要性與保存方式，是保護自己的基本動作。",
    answer: true,
    topic: "個資保護",
    level: "初階",
    fact: "正確。最少揭露原則很重要，不必要的欄位可以不填，敏感資料更要確認用途。"
  }
];

const state = {
  index: 0,
  playerHp: 100,
  enemyHp: 100,
  score: 0,
  streak: 0,
  selectedSkill: "fact",
  locked: false,
  particles: []
};

const els = {
  roundLabel: document.querySelector("#roundLabel"),
  streakLabel: document.querySelector("#streakLabel"),
  scoreLabel: document.querySelector("#scoreLabel"),
  playerHpText: document.querySelector("#playerHpText"),
  enemyHpText: document.querySelector("#enemyHpText"),
  playerHpBar: document.querySelector("#playerHpBar"),
  enemyHpBar: document.querySelector("#enemyHpBar"),
  enemyName: document.querySelector("#enemyName"),
  topicTag: document.querySelector("#topicTag"),
  difficultyTag: document.querySelector("#difficultyTag"),
  claimText: document.querySelector("#claimText"),
  feedbackTitle: document.querySelector("#feedbackTitle"),
  feedbackBody: document.querySelector("#feedbackBody"),
  impactText: document.querySelector("#impactText"),
  truthBtn: document.querySelector("#truthBtn"),
  mythBtn: document.querySelector("#mythBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  restartBtn: document.querySelector("#restartBtn"),
  canvas: document.querySelector("#arenaCanvas")
};

const ctx = els.canvas.getContext("2d");

function currentQuestion() {
  return questions[state.index];
}

function renderQuestion() {
  const q = currentQuestion();
  els.roundLabel.textContent = `${state.index + 1} / ${questions.length}`;
  els.topicTag.textContent = q.topic;
  els.difficultyTag.textContent = q.level;
  els.claimText.textContent = q.claim;
  els.nextBtn.hidden = true;
  state.locked = false;
  setAnswersEnabled(true);
  updateStats();
}

function updateStats() {
  els.streakLabel.textContent = state.streak;
  els.scoreLabel.textContent = state.score;
  els.playerHpText.textContent = Math.max(0, state.playerHp);
  els.enemyHpText.textContent = Math.max(0, state.enemyHp);
  els.playerHpBar.style.width = `${Math.max(0, state.playerHp)}%`;
  els.enemyHpBar.style.width = `${Math.max(0, state.enemyHp)}%`;
}

function chooseAnswer(answer) {
  if (state.locked) return;
  state.locked = true;
  setAnswersEnabled(false);

  const q = currentQuestion();
  const correct = answer === q.answer;
  const damage = calculateDamage(correct);

  if (correct) {
    state.enemyHp = Math.max(0, state.enemyHp - damage);
    state.streak += 1;
    state.score += 100 + state.streak * 20 + damage;
    els.feedbackTitle.textContent = `命中！造成 ${damage} 點闢謠傷害`;
    els.feedbackBody.textContent = q.fact;
    showImpact("TRUTH HIT", "#f2b84b", "enemy");
    document.querySelector(".rumor-fighter").classList.add("shake");
  } else {
    const hurt = state.selectedSkill === "shield" ? 8 : 16;
    state.playerHp = Math.max(0, state.playerHp - hurt);
    state.streak = 0;
    els.feedbackTitle.textContent = `被謠言反擊！損失 ${hurt} 點守護值`;
    els.feedbackBody.textContent = q.fact;
    showImpact("FACT CHECK", "#df5b54", "hero");
    document.querySelector(".hero-fighter").classList.add("shake");
  }

  updateStats();
  setTimeout(() => {
    document.querySelector(".rumor-fighter").classList.remove("shake");
    document.querySelector(".hero-fighter").classList.remove("shake");
  }, 420);

  if (state.enemyHp === 0 || state.playerHp === 0 || state.index === questions.length - 1) {
    endGame();
  } else {
    els.nextBtn.hidden = false;
  }
}

function calculateDamage(correct) {
  if (!correct) return 0;
  if (state.selectedSkill === "combo") {
    return state.streak >= 2 ? 34 : 18;
  }
  if (state.selectedSkill === "shield") return 18;
  return 24;
}

function endGame() {
  setAnswersEnabled(false);
  els.nextBtn.hidden = true;
  els.restartBtn.hidden = false;

  const won = state.enemyHp === 0 || state.playerHp > 0;
  if (won) {
    els.feedbackTitle.textContent = "闢謠成功，實安戰隊勝利！";
    els.feedbackBody.textContent = `你拿下 ${state.score} 分。最強防線不是猜答案，而是願意停一下、查證一下。`;
    els.impactText.textContent = "VICTORY";
  } else {
    els.feedbackTitle.textContent = "謠言暫時佔上風";
    els.feedbackBody.textContent = "重新挑戰一次，把查證節奏抓回來。遇到可疑訊息時，慢半拍通常就是最強防禦。";
    els.impactText.textContent = "RETRY";
  }
}

function nextRound() {
  state.index += 1;
  renderQuestion();
  els.feedbackTitle.textContent = "下一則傳聞來了。";
  els.feedbackBody.textContent = "選一個技能，再判斷這句話是真相或謠言。";
  els.impactText.textContent = "ROUND";
}

function restart() {
  state.index = 0;
  state.playerHp = 100;
  state.enemyHp = 100;
  state.score = 0;
  state.streak = 0;
  state.locked = false;
  els.restartBtn.hidden = true;
  els.feedbackTitle.textContent = "選擇你的判斷，開始第一擊。";
  els.feedbackBody.textContent = "每題都是常見安全迷思。判斷「真相」或「謠言」，答對就能削弱謠言魔王。";
  els.impactText.textContent = "READY";
  renderQuestion();
}

function setAnswersEnabled(enabled) {
  els.truthBtn.disabled = !enabled;
  els.mythBtn.disabled = !enabled;
}

function selectSkill(skill) {
  state.selectedSkill = skill;
  document.querySelectorAll(".skill-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.skill === skill);
  });
}

function showImpact(text, color, side) {
  els.impactText.textContent = text;
  els.impactText.classList.remove("flash");
  void els.impactText.offsetWidth;
  els.impactText.classList.add("flash");

  const originX = side === "enemy" ? 150 : 490;
  const targetX = side === "enemy" ? 500 : 130;
  for (let i = 0; i < 28; i += 1) {
    state.particles.push({
      x: originX,
      y: 160 + Math.random() * 60 - 30,
      vx: (targetX - originX) / 24 + Math.random() * 5 - 2.5,
      vy: Math.random() * 7 - 3.5,
      life: 32 + Math.random() * 18,
      color
    });
  }
}

function drawArena() {
  const width = els.canvas.width;
  const height = els.canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 71 + performance.now() / 28) % width;
    ctx.fillRect(x, 0, 2, height);
  }

  state.particles = state.particles.filter((p) => p.life > 0);
  state.particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03;
    p.life -= 1;
    ctx.globalAlpha = Math.max(0, p.life / 42);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawArena);
}

els.truthBtn.addEventListener("click", () => chooseAnswer(true));
els.mythBtn.addEventListener("click", () => chooseAnswer(false));
els.nextBtn.addEventListener("click", nextRound);
els.restartBtn.addEventListener("click", restart);
document.querySelectorAll(".skill-card").forEach((card) => {
  card.addEventListener("click", () => selectSkill(card.dataset.skill));
});

renderQuestion();
drawArena();
