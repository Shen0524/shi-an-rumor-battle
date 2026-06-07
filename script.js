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
  mode: "solo",
  role: "solo",
  index: 0,
  playerHp: 100,
  enemyHp: 100,
  score: 0,
  streak: 0,
  enemyStreak: 0,
  selectedSkill: "fact",
  locked: false,
  answers: {},
  peer: null,
  conn: null,
  particles: []
};

const els = {
  connectionPanel: document.querySelector("#connectionPanel"),
  connectionStatus: document.querySelector("#connectionStatus"),
  createRoomBtn: document.querySelector("#createRoomBtn"),
  singleBtn: document.querySelector("#singleBtn"),
  pairingBox: document.querySelector("#pairingBox"),
  qrCode: document.querySelector("#qrCode"),
  pairingLink: document.querySelector("#pairingLink"),
  copyLinkBtn: document.querySelector("#copyLinkBtn"),
  roundLabel: document.querySelector("#roundLabel"),
  streakLabel: document.querySelector("#streakLabel"),
  scoreLabel: document.querySelector("#scoreLabel"),
  playerName: document.querySelector("#playerName"),
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

function init() {
  const joinId = new URLSearchParams(window.location.search).get("join");
  if (joinId) {
    joinRoom(joinId);
  } else {
    renderQuestion(false);
    setAnswersEnabled(false);
  }
  drawArena();
}

function renderQuestion(enableAnswers = true) {
  const q = currentQuestion();
  els.roundLabel.textContent = `${state.index + 1} / ${questions.length}`;
  els.topicTag.textContent = q.topic;
  els.difficultyTag.textContent = q.level;
  els.claimText.textContent = q.claim;
  els.nextBtn.hidden = true;
  state.locked = false;
  state.answers = {};
  setAnswersEnabled(enableAnswers);
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

function startSolo() {
  resetGame();
  state.mode = "solo";
  state.role = "solo";
  els.playerName.textContent = "闢謠守護者";
  els.enemyName.textContent = "謠言魔王";
  els.connectionStatus.textContent = "單人練習模式：答對就攻擊謠言魔王。";
  els.pairingBox.hidden = true;
  els.impactText.textContent = "READY";
  renderQuestion(true);
}

function createRoom() {
  if (!window.Peer || !window.QRCode) {
    els.connectionStatus.textContent = "配對套件尚未載入，請確認網路後重新整理頁面。";
    return;
  }

  resetGame();
  state.mode = "multi";
  state.role = "host";
  els.playerName.textContent = "一號選手";
  els.enemyName.textContent = "等待二號選手";
  els.connectionStatus.textContent = "正在建立房間...";
  setAnswersEnabled(false);

  state.peer = new Peer();
  state.peer.on("open", (id) => {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("join", id);
    renderPairingUrl(url.toString());
    els.connectionStatus.textContent = "房間已建立，請第二位選手掃描 QR code。";
  });
  state.peer.on("connection", (conn) => {
    if (state.conn) {
      conn.close();
      return;
    }
    setupConnection(conn);
  });
  state.peer.on("error", () => {
    els.connectionStatus.textContent = "房間建立失敗，請重新整理後再試一次。";
  });
}

function joinRoom(hostId) {
  if (!window.Peer) {
    els.connectionStatus.textContent = "配對套件尚未載入，請確認網路後重新整理頁面。";
    setAnswersEnabled(false);
    return;
  }

  resetGame();
  state.mode = "multi";
  state.role = "guest";
  els.playerName.textContent = "二號選手";
  els.enemyName.textContent = "一號選手";
  els.connectionStatus.textContent = "正在加入房間...";
  els.pairingBox.hidden = true;
  setAnswersEnabled(false);

  state.peer = new Peer();
  state.peer.on("open", () => {
    setupConnection(state.peer.connect(hostId, { reliable: true }));
  });
  state.peer.on("error", () => {
    els.connectionStatus.textContent = "加入房間失敗，請確認 QR code 是否仍有效。";
  });
}

function setupConnection(conn) {
  state.conn = conn;
  conn.on("open", () => {
    els.connectionStatus.textContent = "配對成功！兩位選手請同時作答。";
    els.enemyName.textContent = state.role === "host" ? "二號選手" : "一號選手";
    els.impactText.textContent = "DUEL";
    renderQuestion(true);
    sendMessage("sync", publicState());
  });
  conn.on("data", handleMessage);
  conn.on("close", () => {
    els.connectionStatus.textContent = "對手已離線。可以重新建立房間或改玩單人練習。";
    setAnswersEnabled(false);
  });
  conn.on("error", () => {
    els.connectionStatus.textContent = "連線中斷，請重新配對。";
    setAnswersEnabled(false);
  });
}

function renderPairingUrl(url) {
  els.pairingBox.hidden = false;
  els.pairingLink.href = url;
  els.pairingLink.textContent = url;
  els.qrCode.replaceChildren();
  new QRCode(els.qrCode, {
    text: url,
    width: 150,
    height: 150,
    correctLevel: QRCode.CorrectLevel.M
  });
}

function chooseAnswer(answer) {
  if (state.locked) return;
  if (state.mode === "multi") {
    chooseMultiplayerAnswer(answer);
    return;
  }
  chooseSoloAnswer(answer);
}

function chooseSoloAnswer(answer) {
  state.locked = true;
  setAnswersEnabled(false);

  const q = currentQuestion();
  const correct = answer === q.answer;
  const damage = calculateDamage(correct, state.selectedSkill, state.streak);

  if (correct) {
    state.enemyHp = Math.max(0, state.enemyHp - damage);
    state.streak += 1;
    state.score += 100 + state.streak * 20 + damage;
    els.feedbackTitle.textContent = `命中！造成 ${damage} 點闢謠傷害`;
    els.feedbackBody.textContent = q.fact;
    showImpact("TRUTH HIT", "#f2b84b", "enemy");
    shake(".rumor-fighter");
  } else {
    const hurt = state.selectedSkill === "shield" ? 8 : 16;
    state.playerHp = Math.max(0, state.playerHp - hurt);
    state.streak = 0;
    els.feedbackTitle.textContent = `被謠言反擊！損失 ${hurt} 點守護值`;
    els.feedbackBody.textContent = q.fact;
    showImpact("FACT CHECK", "#df5b54", "hero");
    shake(".hero-fighter");
  }

  updateStats();
  if (state.enemyHp === 0 || state.playerHp === 0 || state.index === questions.length - 1) {
    endSoloGame();
  } else {
    els.nextBtn.hidden = false;
  }
}

function chooseMultiplayerAnswer(answer) {
  state.locked = true;
  setAnswersEnabled(false);
  state.answers.local = { answer, skill: state.selectedSkill, streak: state.streak };
  els.feedbackTitle.textContent = "已送出判斷，等待對手作答。";
  els.feedbackBody.textContent = "雙方都作答後會一起結算傷害。";
  sendMessage("answer", state.answers.local);
  resolveMultiplayerRound();
}

function handleMessage(message) {
  if (!message || !message.type) return;
  if (message.type === "sync") {
    applyRemoteState(message.payload);
  }
  if (message.type === "answer") {
    state.answers.remote = message.payload;
    resolveMultiplayerRound();
  }
  if (message.type === "next") {
    applyRemoteState(message.payload);
    renderQuestion(true);
    els.feedbackTitle.textContent = "新回合開始。";
    els.feedbackBody.textContent = "請判斷這句話是真相或謠言。";
  }
  if (message.type === "restart") {
    resetGame();
    renderQuestion(true);
    els.restartBtn.hidden = true;
    els.feedbackTitle.textContent = "對手重新開始了對戰。";
    els.feedbackBody.textContent = "兩位選手請準備作答。";
  }
}

function resolveMultiplayerRound() {
  if (!state.answers.local || !state.answers.remote) return;

  const q = currentQuestion();
  const localCorrect = state.answers.local.answer === q.answer;
  const remoteCorrect = state.answers.remote.answer === q.answer;
  const localDamage = calculateDamage(localCorrect, state.answers.local.skill, state.streak);
  const remoteDamage = calculateDamage(remoteCorrect, state.answers.remote.skill, state.enemyStreak);

  if (localCorrect) {
    state.enemyHp = Math.max(0, state.enemyHp - localDamage);
    state.streak += 1;
    state.score += 120 + localDamage + state.streak * 15;
    showImpact("HIT", "#f2b84b", "enemy");
    shake(".rumor-fighter");
  } else {
    const hurt = state.answers.local.skill === "shield" ? 8 : 14;
    state.playerHp = Math.max(0, state.playerHp - hurt);
    state.streak = 0;
    showImpact("MISS", "#df5b54", "hero");
    shake(".hero-fighter");
  }

  if (remoteCorrect) {
    state.playerHp = Math.max(0, state.playerHp - remoteDamage);
    state.enemyStreak += 1;
    showImpact("COUNTER", "#df5b54", "hero");
    shake(".hero-fighter");
  } else {
    state.enemyStreak = 0;
  }

  updateStats();
  els.feedbackTitle.textContent = buildRoundTitle(localCorrect, remoteCorrect, localDamage, remoteDamage);
  els.feedbackBody.textContent = q.fact;

  if (state.playerHp === 0 || state.enemyHp === 0 || state.index === questions.length - 1) {
    endMultiplayerGame();
  } else if (state.role === "host") {
    els.nextBtn.hidden = false;
  } else {
    els.feedbackBody.textContent = `${q.fact} 等待房主開始下一題。`;
  }
}

function buildRoundTitle(localCorrect, remoteCorrect, localDamage, remoteDamage) {
  if (localCorrect && remoteCorrect) return `雙方命中！你造成 ${localDamage} 點，也受到 ${remoteDamage} 點。`;
  if (localCorrect) return `你答對了！造成 ${localDamage} 點傷害。`;
  if (remoteCorrect) return `對手答對，你受到 ${remoteDamage} 點傷害。`;
  return "雙方都被謠言迷惑，這回合沒有命中。";
}

function calculateDamage(correct, skill, streak) {
  if (!correct) return 0;
  if (skill === "combo") return streak >= 2 ? 34 : 18;
  if (skill === "shield") return 18;
  return 24;
}

function nextRound() {
  state.index += 1;
  if (state.mode === "multi") {
    renderQuestion(true);
    els.feedbackTitle.textContent = "下一題開始。";
    els.feedbackBody.textContent = "兩位選手請同時作答。";
    sendMessage("next", publicState());
    return;
  }

  renderQuestion(true);
  els.feedbackTitle.textContent = "下一則傳聞來了。";
  els.feedbackBody.textContent = "選一個技能，再判斷這句話是真相或謠言。";
  els.impactText.textContent = "ROUND";
}

function endSoloGame() {
  setAnswersEnabled(false);
  els.nextBtn.hidden = true;
  els.restartBtn.hidden = false;

  const won = state.enemyHp === 0 || state.playerHp > 0;
  if (won) {
    els.feedbackTitle.textContent = "闢謠成功，資安戰隊勝利！";
    els.feedbackBody.textContent = `你拿下 ${state.score} 分。最強防線不是猜答案，而是願意停一下、查證一下。`;
    els.impactText.textContent = "VICTORY";
  } else {
    els.feedbackTitle.textContent = "謠言暫時佔上風";
    els.feedbackBody.textContent = "重新挑戰一次，把查證節奏抓回來。遇到可疑訊息時，慢半拍通常就是最強防禦。";
    els.impactText.textContent = "RETRY";
  }
}

function endMultiplayerGame() {
  setAnswersEnabled(false);
  els.nextBtn.hidden = true;
  els.restartBtn.hidden = false;

  if (state.playerHp > state.enemyHp) {
    els.feedbackTitle.textContent = "你贏得這場資安闢謠對戰！";
    els.impactText.textContent = "WIN";
  } else if (state.playerHp < state.enemyHp) {
    els.feedbackTitle.textContent = "對手暫時領先，重新挑戰追回來。";
    els.impactText.textContent = "RETRY";
  } else {
    els.feedbackTitle.textContent = "平手！兩位選手都守住了資安防線。";
    els.impactText.textContent = "DRAW";
  }
  els.feedbackBody.textContent = `你的分數：${state.score}。重新開始會同步通知對手。`;
}

function restart() {
  resetGame();
  els.restartBtn.hidden = true;
  if (state.mode === "multi") {
    renderQuestion(true);
    sendMessage("restart", publicState());
    els.feedbackTitle.textContent = "雙人對戰重新開始。";
    els.feedbackBody.textContent = "兩位選手請準備作答。";
    return;
  }
  startSolo();
}

function resetGame() {
  state.index = 0;
  state.playerHp = 100;
  state.enemyHp = 100;
  state.score = 0;
  state.streak = 0;
  state.enemyStreak = 0;
  state.locked = false;
  state.answers = {};
  els.impactText.textContent = "READY";
  updateStats();
}

function publicState() {
  return {
    index: state.index,
    playerHp: state.enemyHp,
    enemyHp: state.playerHp,
    streak: state.enemyStreak,
    enemyStreak: state.streak
  };
}

function applyRemoteState(remote) {
  if (!remote) return;
  state.index = remote.index;
  state.playerHp = remote.playerHp;
  state.enemyHp = remote.enemyHp;
  state.streak = remote.streak;
  state.enemyStreak = remote.enemyStreak;
  updateStats();
}

function sendMessage(type, payload) {
  if (state.conn && state.conn.open) {
    state.conn.send({ type, payload });
  }
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

function shake(selector) {
  const node = document.querySelector(selector);
  node.classList.add("shake");
  setTimeout(() => node.classList.remove("shake"), 420);
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

els.createRoomBtn.addEventListener("click", createRoom);
els.singleBtn.addEventListener("click", startSolo);
els.copyLinkBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(els.pairingLink.href);
  els.copyLinkBtn.textContent = "已複製";
  setTimeout(() => {
    els.copyLinkBtn.textContent = "複製連結";
  }, 1200);
});
els.truthBtn.addEventListener("click", () => chooseAnswer(true));
els.mythBtn.addEventListener("click", () => chooseAnswer(false));
els.nextBtn.addEventListener("click", nextRound);
els.restartBtn.addEventListener("click", restart);
document.querySelectorAll(".skill-card").forEach((card) => {
  card.addEventListener("click", () => selectSkill(card.dataset.skill));
});

init();
