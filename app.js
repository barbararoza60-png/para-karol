(() => {
  "use strict";

  const content = window.KAROL_CONTENT;
  if (!content) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const storage = {
    read(key, fallback) {
      try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
      } catch {
        return fallback;
      }
    },
    write(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // El sitio sigue funcionando si el navegador bloquea el guardado local.
      }
    }
  };

  function restartAnimation(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  // Contenido centralizado
  $("#hero-eyebrow").textContent = content.hero.eyebrow;
  $("#hero-title").textContent = content.hero.title;
  $("#hero-message").textContent = content.hero.message;
  $("#hero-keepsake-text").textContent = content.hero.keepsake;
  $("#closing-heading").textContent = content.closing.title;
  const closingMessage = $("#closing-message");
  const closingParagraphs = Array.isArray(content.closing.message)
    ? content.closing.message
    : [content.closing.message];
  closingParagraphs.forEach((paragraph) => {
    const element = document.createElement("p");
    element.textContent = paragraph;
    closingMessage.append(element);
  });
  $("#closing-signature").textContent = content.closing.signature;
  $("#closing-date").textContent = content.closing.date;
  $("#closing-date").dateTime = "2026-07-24";
  $("#closing-postscript").textContent = content.closing.postscript;

  // Navegación tipo app en celular: una pantalla a la vez.
  const mobileViewport = window.matchMedia("(max-width: 759px)");
  const mobileViews = $$("#contenido > section");
  const mobileViewIds = new Set(mobileViews.map((view) => view.id));
  const mobileBack = $("#mobile-back");
  const mobileBackLabel = $("#mobile-back-label");
  let currentMobileView = "inicio";

  function mobileVisibleHeight() {
    return Math.max(
      320,
      Math.ceil(
        window.visualViewport?.height ||
        window.innerHeight ||
        document.documentElement.clientHeight
      )
    );
  }

  function syncMobileViewportHeight() {
    document.documentElement.style.setProperty(
      "--mobile-viewport-height",
      `${mobileVisibleHeight()}px`
    );
  }

  function viewFromHash() {
    const requested = location.hash.replace("#", "");
    return mobileViewIds.has(requested) ? requested : currentMobileView || "inicio";
  }

  function renderMobileView(viewId = viewFromHash()) {
    syncMobileViewportHeight();
    if (!mobileViewport.matches) {
      document.documentElement.classList.remove("mobile-view-mode");
      document.body.classList.remove("mobile-view-mode");
      mobileViews.forEach((view) => {
        view.classList.remove("is-active-view");
        view.removeAttribute("aria-hidden");
      });
      mobileBack.hidden = true;
      return;
    }

    const nextView = mobileViewIds.has(viewId) ? viewId : "inicio";
    currentMobileView = nextView;
    document.documentElement.classList.add("mobile-view-mode");
    document.body.classList.add("mobile-view-mode");
    mobileViews.forEach((view) => {
      const isActive = view.id === nextView;
      view.classList.toggle("is-active-view", isActive);
      view.setAttribute("aria-hidden", String(!isActive));
      if (isActive) view.scrollTop = 0;
    });

    mobileBack.hidden = nextView === "inicio";
    mobileBackLabel.textContent = nextView === "menu-regalo" ? "Volver al inicio" : "Volver al menú";
  }

  function goToMobileView(viewId, replace = false) {
    const nextHash = `#${viewId}`;
    if (replace) history.replaceState({ viewId }, "", nextHash);
    else history.pushState({ viewId }, "", nextHash);
    renderMobileView(viewId);
  }

  $("#open-gift").addEventListener("click", (event) => {
    if (!mobileViewport.matches) return;
    event.preventDefault();
    goToMobileView("menu-regalo");
  });

  $$(".gift-menu-card").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!mobileViewport.matches) return;
      event.preventDefault();
      goToMobileView(link.hash.replace("#", ""));
    });
  });

  $(".brand").addEventListener("click", (event) => {
    if (!mobileViewport.matches) return;
    event.preventDefault();
    goToMobileView("inicio");
  });

  mobileBack.addEventListener("click", () => {
    goToMobileView(currentMobileView === "menu-regalo" ? "inicio" : "menu-regalo");
  });

  window.addEventListener("hashchange", () => renderMobileView(viewFromHash()));
  window.addEventListener("popstate", () => renderMobileView(viewFromHash()));
  if (typeof mobileViewport.addEventListener === "function") {
    mobileViewport.addEventListener("change", () => renderMobileView(viewFromHash()));
  } else {
    mobileViewport.addListener(() => renderMobileView(viewFromHash()));
  }
  window.addEventListener("resize", syncMobileViewportHeight, { passive: true });
  window.visualViewport?.addEventListener("resize", syncMobileViewportHeight, {
    passive: true
  });
  renderMobileView(location.hash ? viewFromHash() : "inicio");

  // Apariciones suaves al hacer scroll
  const revealItems = $$(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // Confetti liviano, sin librerías
  const confettiLayer = $("#confetti-layer");
  const confettiColors = ["#a95143", "#c997a7", "#7d9278", "#e1b268", "#eadbc9"];

  function confettiViewportHeight() {
    return Math.max(
      320,
      Math.ceil(
        window.visualViewport?.height ||
        window.innerHeight ||
        document.documentElement.clientHeight
      )
    );
  }

  function syncConfettiViewport() {
    confettiLayer.style.setProperty(
      "--confetti-viewport-height",
      `${confettiViewportHeight()}px`
    );
  }

  function throwConfetti(amount = 58) {
    if (reducedMotion) return;
    syncConfettiViewport();
    const existingPieces = confettiLayer.childElementCount;
    const fallDistance = confettiViewportHeight() + 35;

    for (let index = 0; index < amount; index += 1) {
      const piece = document.createElement("i");

      piece.className = "confetti-piece";
      piece.style.left = `${1 + Math.random() * 98}%`;
      piece.style.background =
        confettiColors[(existingPieces + index) % confettiColors.length];
      piece.style.width = `${7 + Math.random() * 5}px`;
      piece.style.height = `${11 + Math.random() * 9}px`;
      piece.style.setProperty("--fall-time", `${2.6 + Math.random() * 2.2}s`);
      piece.style.setProperty("--drift", `${-70 + Math.random() * 140}px`);
      piece.style.setProperty("--spin", `${360 + Math.random() * 760}deg`);
      piece.style.setProperty("--fall-distance", `${fallDistance}px`);
      piece.style.animationDelay = `${Math.random() * 0.45}s`;
      piece.style.transform = `rotate(${Math.random() * 180}deg)`;
      piece.addEventListener("animationend", () => piece.remove(), { once: true });
      confettiLayer.append(piece);
    }
  }

  syncConfettiViewport();
  window.addEventListener("resize", syncConfettiViewport, { passive: true });
  window.visualViewport?.addEventListener("resize", syncConfettiViewport, { passive: true });
  $("#confetti-again").addEventListener("click", () => throwConfetti(44));
  window.setTimeout(() => throwConfetti(), 320);

  // Cartas para abrir cuando haga falta
  const letterButtons = $("#letter-buttons");
  const letterDialog = $("#letter-dialog");
  const letterDialogKicker = $("#letter-dialog-kicker");
  const letterDialogTitle = $("#letter-dialog-title");
  const letterDialogBody = $("#letter-dialog-body");
  const letterDialogSignature = $("#letter-dialog-signature");

  function openLetter(letter) {
    letterDialogKicker.textContent = letter.kicker;
    letterDialogTitle.textContent = letter.title;
    letterDialogBody.replaceChildren();
    letter.body.forEach((paragraph) => {
      const text = document.createElement("p");
      text.textContent = paragraph;
      letterDialogBody.append(text);
    });
    letterDialogSignature.textContent = letter.signature;
    letterDialog.showModal();
  }

  content.openWhenLetters.forEach((letter, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "letter-choice";
    button.innerHTML = `
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${letter.tab}</strong>
      <i aria-hidden="true">↗</i>
    `;
    button.addEventListener("click", () => openLetter(letter));
    letterButtons.append(button);
  });

  function closeLetter() {
    letterDialog.close();
  }

  $("#letter-dialog-close").addEventListener("click", closeLetter);
  $("#letter-dialog-done").addEventListener("click", closeLetter);
  letterDialog.addEventListener("click", (event) => {
    if (event.target === letterDialog) closeLetter();
  });

  // Calendario de turnos
  const CALENDAR_KEY = "paraKarol.calendar.v1";
  const calendarGrid = $("#calendar-grid");
  const calendarMonth = $("#calendar-month");
  const calendarLegend = $("#calendar-legend");
  const dayDialog = $("#day-dialog");
  const dayForm = $("#day-form");
  const dayNote = $("#day-note");
  const dayDelete = $("#day-delete");
  if (calendarGrid) {
  let calendarEntries = storage.read(CALENDAR_KEY, {});
  let visibleMonth = new Date();
  visibleMonth.setDate(1);
  visibleMonth.setHours(12, 0, 0, 0);
  let activeDateKey = "";

  function dateKey(date) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }

  function entryTag(entry) {
    return entry ? content.calendarTags.find((tag) => tag.id === entry.tag) : null;
  }

  function renderLegend() {
    calendarLegend.replaceChildren();
    content.calendarTags.forEach((tag) => {
      const item = document.createElement("span");
      item.className = "legend-item";
      item.innerHTML = `<i class="legend-dot" style="background:${tag.color}"></i>${tag.label}`;
      calendarLegend.append(item);
    });
  }

  function renderTagOptions() {
    const container = $("#day-tag-options");
    container.replaceChildren();
    content.calendarTags.forEach((tag, index) => {
      const wrap = document.createElement("div");
      wrap.className = "day-tag-option";
      wrap.style.setProperty("--tag-color", tag.color);
      wrap.innerHTML = `
        <input id="tag-${tag.id}" type="radio" name="dayTag" value="${tag.id}" ${index === 0 ? "required" : ""}>
        <label for="tag-${tag.id}"><i class="tag-swatch"></i>${tag.label}</label>
      `;
      container.append(wrap);
    });
  }

  function renderCalendar() {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const monthLabel = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(visibleMonth);
    calendarMonth.textContent = capitalize(monthLabel);
    calendarGrid.replaceChildren();

    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = dateKey(new Date());

    for (let index = 0; index < firstWeekday; index += 1) {
      const spacer = document.createElement("span");
      spacer.className = "calendar-spacer";
      spacer.setAttribute("aria-hidden", "true");
      calendarGrid.append(spacer);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day, 12);
      const key = dateKey(date);
      const entry = calendarEntries[key];
      const tag = entryTag(entry);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "calendar-day";
      button.setAttribute("role", "gridcell");
      button.dataset.date = key;
      if (key === today) button.classList.add("is-today");

      const spokenDate = new Intl.DateTimeFormat("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long"
      }).format(date);
      const entryDescription = tag ? `, ${tag.label}${entry.note ? `, nota: ${entry.note}` : ""}` : ", sin marca";
      button.setAttribute("aria-label", `${spokenDate}${entryDescription}`);

      const number = document.createElement("span");
      number.className = "day-number";
      number.textContent = day;
      button.append(number);

      if (tag) {
        const marker = document.createElement("span");
        marker.className = "day-marker";
        marker.textContent = tag.label;
        marker.style.background = tag.color;
        button.append(marker);
      }
      if (entry?.note) {
        const dot = document.createElement("span");
        dot.className = "day-note-dot";
        dot.setAttribute("aria-hidden", "true");
        button.append(dot);
      }

      button.addEventListener("click", () => openDayEditor(key, date));
      calendarGrid.append(button);
    }
  }

  function openDayEditor(key, date) {
    activeDateKey = key;
    const entry = calendarEntries[key];
    const formatted = new Intl.DateTimeFormat("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(date);
    $("#day-dialog-title").textContent = capitalize(formatted);
    $$('input[name="dayTag"]', dayForm).forEach((input) => {
      input.checked = input.value === entry?.tag;
    });
    dayNote.value = entry?.note || "";
    dayDelete.disabled = !entry;
    dayDialog.showModal();
  }

  dayForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = $('input[name="dayTag"]:checked', dayForm);
    if (!selected) {
      $('input[name="dayTag"]', dayForm).reportValidity();
      return;
    }
    calendarEntries[activeDateKey] = {
      tag: selected.value,
      note: dayNote.value.trim()
    };
    storage.write(CALENDAR_KEY, calendarEntries);
    renderCalendar();
    dayDialog.close();
  });

  dayDelete.addEventListener("click", () => {
    if (!activeDateKey) return;
    delete calendarEntries[activeDateKey];
    storage.write(CALENDAR_KEY, calendarEntries);
    renderCalendar();
    dayDialog.close();
  });

  $("#day-close").addEventListener("click", () => dayDialog.close());
  $("#calendar-prev").addEventListener("click", () => {
    visibleMonth.setMonth(visibleMonth.getMonth() - 1);
    renderCalendar();
  });
  $("#calendar-next").addEventListener("click", () => {
    visibleMonth.setMonth(visibleMonth.getMonth() + 1);
    renderCalendar();
  });

  renderLegend();
  renderTagOptions();
  renderCalendar();
  }

  // Frasco de notas sin repeticiones
  const JAR_KEY = "paraKarol.jarDeck.v1";
  const noteText = $("#paper-note-text");
  const noteCard = $("#paper-note");
  const noteCount = $("#paper-note-count");
  const jarLayout = $(".jar-layout");
  const drawNoteButton = $("#draw-note");
  const saveNoteButton = $("#save-note");
  const noteJar = drawNoteButton;
  let noteDeck = storage
    .read(JAR_KEY, [])
    .filter((index) => Number.isInteger(index) && index >= 0 && index < content.jarNotes.length);

  function freshDeck() {
    return content.jarNotes.map((_, index) => index);
  }

  function updateNoteCount(justReset = false) {
    if (noteDeck.length === 0) {
      noteCount.textContent = "Ese era el último. En el próximo click se mezclan todos de nuevo.";
    } else if (justReset) {
      noteCount.textContent = `Frasco mezclado de nuevo: ${noteDeck.length} papelitos.`;
    } else {
      noteCount.textContent = `Quedan ${noteDeck.length} papelitos antes de volver a mezclar.`;
    }
  }

  drawNoteButton.addEventListener("click", () => {
    if (jarLayout.classList.contains("has-note")) return;

    let justReset = false;
    if (noteDeck.length === 0) {
      noteDeck = freshDeck();
      justReset = true;
    }
    const deckPosition = Math.floor(Math.random() * noteDeck.length);
    const [noteIndex] = noteDeck.splice(deckPosition, 1);
    noteText.textContent = content.jarNotes[noteIndex];
    drawNoteButton.disabled = true;
    storage.write(JAR_KEY, noteDeck);
    restartAnimation(noteJar, "is-drawing");
    updateNoteCount(justReset);

    window.setTimeout(() => {
      noteCard.hidden = false;
      jarLayout.classList.add("has-note");
      restartAnimation(noteCard, "is-new");
      saveNoteButton.focus({ preventScroll: true });
    }, 280);
  });

  saveNoteButton.addEventListener("click", () => {
    noteCard.classList.add("is-saving");
    window.setTimeout(() => {
      noteCard.hidden = true;
      noteCard.classList.remove("is-new", "is-saving");
      jarLayout.classList.remove("has-note");
      drawNoteButton.disabled = false;
      drawNoteButton.setAttribute("aria-label", "Sacar un papelito del frasco");
      drawNoteButton.focus({ preventScroll: true });
    }, 260);
  });

  if (noteDeck.length) updateNoteCount();
  else noteCount.textContent = `${content.jarNotes.length} papelitos esperando su turno.`;

  // Respiración guiada 4-7-8
  const breathingCard = $("#breathing-card");
  const breathingCircle = $("#breathing-circle");
  const breathPhase = $("#breath-phase");
  const breathInstruction = $("#breath-instruction");
  const breathCount = $("#breath-count");
  const breathToggle = $("#breath-toggle");
  const breathCycles = $("#breath-cycles");
  const phases = [
    { id: "inhale", title: "Inhalá suave", instruction: "Dejá que el aire entre durante 4 segundos.", seconds: 4 },
    { id: "hold", title: "Sostené, sin apretar", instruction: "Quedate acá durante 7 segundos.", seconds: 7 },
    { id: "exhale", title: "Soltá despacito", instruction: "Vaciá el aire durante 8 segundos.", seconds: 8 }
  ];
  let breathingTimer = null;
  let isBreathing = false;
  let phaseIndex = 0;
  let secondsLeft = 0;
  let completedCycles = 0;

  function showPhase() {
    const phase = phases[phaseIndex];
    secondsLeft = phase.seconds;
    breathingCard.dataset.phase = phase.id;
    breathPhase.textContent = phase.title;
    breathInstruction.textContent = phase.instruction;
    breathCount.textContent = secondsLeft;
    breathingCircle.style.transitionDuration = `${phase.seconds}s`;
    breathingCircle.className = `breathing-circle ${phase.id}`;
  }

  function stopBreathing() {
    window.clearInterval(breathingTimer);
    breathingTimer = null;
    isBreathing = false;
    breathingCard.classList.remove("is-running");
    breathingCard.dataset.phase = "rest";
    breathingCircle.style.transitionDuration = "500ms";
    breathingCircle.className = "breathing-circle rest";
    breathPhase.textContent = "Pausa hecha";
    breathInstruction.textContent = "Cuando quieras, arrancamos otro ciclo.";
    breathCount.textContent = "·";
    breathToggle.textContent = "Empezar de nuevo";
  }

  function advanceBreathingPhase() {
    if (phaseIndex === phases.length - 1) {
      completedCycles += 1;
      breathCycles.textContent = `Ciclos completos: ${completedCycles}`;
    }
    phaseIndex = (phaseIndex + 1) % phases.length;
    showPhase();
  }

  function startBreathing() {
    isBreathing = true;
    phaseIndex = 0;
    breathingCard.classList.add("is-running");
    breathToggle.textContent = "Pausar";
    showPhase();
    breathingTimer = window.setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        advanceBreathingPhase();
      } else {
        breathCount.textContent = secondsLeft;
      }
    }, 1000);
  }

  breathToggle.addEventListener("click", () => {
    if (isBreathing) stopBreathing();
    else startBreathing();
  });

  // Frases con pequeñas entradas distintas
  const affirmation = $("#affirmation-text");
  const affirmationMotions = ["motion-rise", "motion-tilt", "motion-soft"];
  let affirmationIndex = 0;
  let affirmationMotionIndex = 0;
  affirmation.textContent = content.affirmations[affirmationIndex];

  $("#new-affirmation").addEventListener("click", () => {
    let next = affirmationIndex;
    while (next === affirmationIndex && content.affirmations.length > 1) {
      next = Math.floor(Math.random() * content.affirmations.length);
    }
    affirmationIndex = next;
    affirmationMotionIndex = (affirmationMotionIndex + 1) % affirmationMotions.length;
    affirmation.classList.remove(...affirmationMotions);
    affirmation.textContent = content.affirmations[affirmationIndex];
    restartAnimation(affirmation, affirmationMotions[affirmationMotionIndex]);
  });

  // Meta compartida
  const GOAL_KEY = "paraKarol.goal.v1";
  const goalForm = $("#goal-form");
  const goalName = $("#goal-name");
  const goalMode = $("#goal-mode");
  const goalCurrent = $("#goal-current");
  const goalTarget = $("#goal-target");
  const goalTargetWrap = $("#goal-target-wrap");
  const goalCurrency = $("#goal-currency");
  const goalCurrencyWrap = $("#goal-currency-wrap");
  const goalFill = $("#goal-fill");
  const goalPercent = $("#goal-percent");
  const goalSummary = $("#goal-summary");
  const goalSaved = $("#goal-saved");
  const goalJar = $(".goal-jar");
  if (goalForm) {
  let goal = { ...content.goalDefaults, ...storage.read(GOAL_KEY, {}) };

  function currencyText(value, currency) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "PYG" ? 0 : 2
    }).format(value);
  }

  function syncGoalMode() {
    const isPercent = goalMode.value === "percent";
    goalTargetWrap.hidden = isPercent;
    goalCurrencyWrap.hidden = isPercent;
    goalTarget.required = !isPercent;
    goalCurrent.max = isPercent ? "100" : "";
    $("#goal-current-label").textContent = isPercent ? "Avance actual (%)" : "Ya juntamos";
  }

  function renderGoal(animate = false) {
    const target = goal.mode === "percent" ? 100 : Math.max(Number(goal.target), 0.01);
    const current = Math.max(Number(goal.current), 0);
    const rawPercent = (current / target) * 100;
    const fillPercent = Math.min(Math.max(rawPercent, 0), 100);
    goalFill.style.height = `${fillPercent}%`;
    goalPercent.textContent = `${Math.round(rawPercent)}%`;

    if (goal.mode === "percent") {
      goalSummary.textContent = `${goal.name}: vamos por ${Math.round(current)}%. ${current >= 100 ? "¡Meta cumplida, che!" : "Pasito a pasito."}`;
    } else {
      goalSummary.textContent = `${goal.name}: ${currencyText(current, goal.currency)} de ${currencyText(target, goal.currency)}. ${current >= target ? "¡Meta cumplida, che!" : "Vamos sumando."}`;
    }

    if (animate) {
      restartAnimation(goalJar, "is-saved");
    }
  }

  function fillGoalForm() {
    goalName.value = goal.name;
    goalMode.value = goal.mode;
    goalCurrent.value = goal.current;
    goalTarget.value = goal.target;
    goalCurrency.value = goal.currency;
    syncGoalMode();
    renderGoal();
  }

  goalMode.addEventListener("change", syncGoalMode);
  goalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const mode = goalMode.value;
    goal = {
      name: goalName.value.trim(),
      mode,
      current: Math.max(Number(goalCurrent.value), 0),
      target: mode === "percent" ? 100 : Math.max(Number(goalTarget.value), 0.01),
      currency: goalCurrency.value
    };
    storage.write(GOAL_KEY, goal);
    renderGoal(true);
    goalSaved.textContent = "Listo, quedó guardado en este dispositivo ♥";
    window.setTimeout(() => {
      goalSaved.textContent = "";
    }, 3500);
  });

  fillGoalForm();
  }

  // Una misión breve para sentirse cerca, distinta cada día
  const TOGETHER_KEY = "paraKarol.together.v1";
  const missionCard = $("#mission-card");
  const missionDate = $("#mission-date");
  const missionTitle = $("#mission-title");
  const missionPrompt = $("#mission-prompt");
  const missionDone = $("#mission-done");
  const missionStatus = $("#mission-status");

  function dateKeyFor(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  let missionToday = new Date();
  let todayKey = dateKeyFor(missionToday);
  let missionState = storage.read(TOGETHER_KEY, {});

  function dailyMissionIndex(dateKey = todayKey) {
    const seed = [...dateKey].reduce((total, character) => total + character.charCodeAt(0), 0);
    return seed % content.togetherMissions.length;
  }

  function syncMissionForCurrentDay() {
    const now = new Date();
    const currentDateKey = dateKeyFor(now);
    missionToday = now;
    todayKey = currentDateKey;

    if (
      missionState.date === currentDateKey &&
      Number.isInteger(missionState.index) &&
      missionState.index >= 0 &&
      missionState.index < content.togetherMissions.length
    ) {
      return false;
    }

    missionState = {
      date: currentDateKey,
      index: dailyMissionIndex(currentDateKey),
      done: false
    };
    storage.write(TOGETHER_KEY, missionState);
    return true;
  }

  syncMissionForCurrentDay();

  function currentMission() {
    return content.togetherMissions[missionState.index];
  }

  function renderMission(message = "") {
    const mission = currentMission();
    const formattedDate = new Intl.DateTimeFormat("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(missionToday);
    missionDate.textContent = `Para hoy · ${formattedDate}`;
    missionTitle.textContent = mission.title;
    missionPrompt.textContent = mission.prompt;
    missionDone.textContent = missionState.done ? "Hecho! ♥" : "Marcarlo como hecho!";
    missionDone.setAttribute("aria-pressed", String(Boolean(missionState.done)));
    missionCard.classList.toggle("is-complete", Boolean(missionState.done));
    missionStatus.textContent = message || (missionState.done ? "Listo. Hoy el mapa quedó un poquito más chico." : "");
  }

  missionDone.addEventListener("click", () => {
    syncMissionForCurrentDay();
    missionState.done = !missionState.done;
    storage.write(TOGETHER_KEY, missionState);
    renderMission(missionState.done ? "Guardada para hoy. Sin racha, sin culpa: solamente un ratito juntas." : "La dejamos pendiente, cero drama.");
    if (missionState.done) throwConfetti(24);
  });

  $("#mission-next").addEventListener("click", () => {
    syncMissionForCurrentDay();
    missionState.index = (missionState.index + 1) % content.togetherMissions.length;
    missionState.done = false;
    storage.write(TOGETHER_KEY, missionState);
    renderMission("Nueva misión servida. Esta capaz pega mejor con hoy.");
    restartAnimation(missionCard, "is-changing");
  });

  async function copyMission(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Sigue con el método compatible con navegadores más viejos.
      }
    }
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.append(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    return copied;
  }

  $("#mission-share").addEventListener("click", async () => {
    const dayChanged = syncMissionForCurrentDay();
    if (dayChanged) renderMission("Nuevo día, nueva misión ♥");
    const mission = currentMission();
    try {
      if (navigator.share) {
        await navigator.share({ title: `Dos minutos juntas · ${mission.title}`, text: mission.shareText });
        missionStatus.textContent = "Misión lista para viajar ♥";
        return;
      }
      const copied = await copyMission(mission.shareText);
      missionStatus.textContent = copied
        ? "Copiada. Pegala en nuestro chat y que empiece la misión."
        : "No pude copiarla, pero podés mandarme el título de la misión.";
    } catch (error) {
      if (error?.name !== "AbortError") {
        const copied = await copyMission(mission.shareText);
        missionStatus.textContent = copied ? "Copiada para mandar por WhatsApp." : "No pude compartirla esta vez.";
      }
    }
  });

  function refreshMissionAtDayChange() {
    if (!syncMissionForCurrentDay()) return;
    renderMission("Nuevo día, nueva misión ♥");
    restartAnimation(missionCard, "is-changing");
  }

  window.setInterval(refreshMissionAtDayChange, 60_000);
  window.addEventListener("focus", refreshMissionAtDayChange);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshMissionAtDayChange();
  });

  renderMission();

  // Galería: descubre 1.jpg, 2.jpg... hasta el primer número que falte.
  const galleryImage = $("#gallery-image");
  const galleryMood = $("#gallery-mood");
  const galleryCaption = $("#gallery-caption");
  const galleryCounter = $("#gallery-counter");
  const galleryPolaroid = $("#gallery-polaroid");
  const galleryStage = $("#gallery-stage");
  const galleryDots = $("#gallery-dots");
  const galleryFlapStatus = $("#gallery-flap-status");
  const GALLERY_FIRST_KEY = "paraKarol.galleryFirst.v1";
  let galleryCount = Math.max(content.galleryCaptions.length, 1);
  let galleryOrder = [];
  let galleryIndex = 0;
  let pointerStartX = null;
  let galleryEffectDeck = [];
  let lastGalleryEffect = -1;
  let galleryEffectRun = 0;
  let galleryVersionRun = 0;
  const galleryAlteredImages = new Set();

  const galleryEffects = [
    { className: "is-flapping", status: "Frrr, frrr: Lima mandó un aleteo internacional." },
    { className: "is-shaking", status: "Lima activó el modo licuadora por motivos científicos." },
    { className: "is-flying", status: "Lima salió volando a llevar un chisme y ya volvió." },
    { className: "is-rocketing", status: "Despegue autorizado: Lima fue al espacio y regresó para la foto." },
    { className: "is-spinning", status: "Giro reglamentario de supervisora general." },
    { className: "is-bouncing", status: "Lima rebotó de emoción. El noticiero continúa." },
    { className: "is-zooming", status: "Primerísimo primer plano: nivel de drama completamente necesario." },
    { className: "is-flipping", status: "Lima hizo una pirueta que su seguro no cubre." },
    { className: "is-teleporting", status: "Lima se teletransportó. La paloma es la principal sospechosa." },
    { className: "is-tiny", status: "Lima se hizo diminuta para entrar en tu bolsillo un segundo." },
    { className: "is-wobbling", status: "Se detectó una inestabilidad de pajarito muy seria." },
    { className: "is-dramatic", status: "Entrada dramática de Lima: cero contexto, toda la actitud." }
  ];
  const galleryEffectClasses = galleryEffects.map((effect) => effect.className);

  function galleryPath(index) {
    return `./img/lima/${index + 1}.jpg`;
  }

  function extraGalleryCaption(number) {
    return content.galleryExtraCaption.replace("{n}", number);
  }

  function normalGalleryCaption(imageIndex) {
    return content.galleryCaptions[imageIndex] || extraGalleryCaption(imageIndex + 1);
  }

  function applyGalleryVersion(imageIndex) {
    const alterEgo = content.galleryAlterEgos?.[imageIndex];
    const isAltered = Boolean(alterEgo && galleryAlteredImages.has(imageIndex));

    galleryPolaroid.classList.toggle("is-altered", isAltered);
    if (!isAltered) {
      galleryPolaroid.style.removeProperty("--lima-alt-color");
      galleryPolaroid.style.removeProperty("--lima-alt-accent");
      galleryPolaroid.style.removeProperty("--lima-alt-ink");
      galleryPolaroid.style.removeProperty("--lima-alt-filter");
      galleryMood.hidden = true;
      galleryMood.textContent = "";
      galleryCaption.textContent = normalGalleryCaption(imageIndex);
      galleryImage.alt = `Lima, el pajarito de la familia, en la foto ${imageIndex + 1}`;
      return;
    }

    galleryPolaroid.style.setProperty("--lima-alt-color", alterEgo.color);
    galleryPolaroid.style.setProperty("--lima-alt-accent", alterEgo.accent);
    galleryPolaroid.style.setProperty("--lima-alt-ink", alterEgo.ink);
    galleryPolaroid.style.setProperty("--lima-alt-filter", alterEgo.filter);
    galleryMood.hidden = false;
    galleryMood.textContent = alterEgo.label;
    galleryCaption.textContent = `“${alterEgo.message}”`;
    galleryImage.alt = `Lima en su versión ${alterEgo.label.toLowerCase()}, foto ${imageIndex + 1}`;
  }

  function shuffleGallery(count) {
    const order = Array.from({ length: count }, (_, index) => index);
    for (let index = order.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
    }

    const previousFirst = storage.read(GALLERY_FIRST_KEY, -1);
    if (order.length > 1 && order[0] === previousFirst) {
      const swapIndex = 1 + Math.floor(Math.random() * (order.length - 1));
      [order[0], order[swapIndex]] = [order[swapIndex], order[0]];
    }
    storage.write(GALLERY_FIRST_KEY, order[0]);
    return order;
  }

  function nextGalleryEffect() {
    if (galleryEffectDeck.length === 0) {
      galleryEffectDeck = galleryEffects.map((_, index) => index);
      for (let index = galleryEffectDeck.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [galleryEffectDeck[index], galleryEffectDeck[randomIndex]] = [
          galleryEffectDeck[randomIndex],
          galleryEffectDeck[index]
        ];
      }
      if (
        galleryEffectDeck.length > 1 &&
        galleryEffectDeck[galleryEffectDeck.length - 1] === lastGalleryEffect
      ) {
        [galleryEffectDeck[0], galleryEffectDeck[galleryEffectDeck.length - 1]] = [
          galleryEffectDeck[galleryEffectDeck.length - 1],
          galleryEffectDeck[0]
        ];
      }
    }

    const effectIndex = galleryEffectDeck.pop();
    lastGalleryEffect = effectIndex;
    return galleryEffects[effectIndex];
  }

  function playGalleryEffect() {
    if (reducedMotion) {
      const imageIndex = galleryOrder[galleryIndex] ?? galleryIndex;
      const alterEgo = content.galleryAlterEgos?.[imageIndex];
      if (alterEgo) {
        if (galleryAlteredImages.has(imageIndex)) {
          galleryAlteredImages.delete(imageIndex);
        } else {
          galleryAlteredImages.add(imageIndex);
        }
        applyGalleryVersion(imageIndex);
      }
      galleryFlapStatus.textContent = "Lima recibió el toque y cambió de versión: pío pío.";
      window.setTimeout(() => {
        galleryFlapStatus.textContent = "";
      }, 1200);
      return;
    }

    galleryVersionRun += 1;
    galleryPolaroid.classList.remove("is-version-fading");
    const effect = nextGalleryEffect();
    const effectRun = ++galleryEffectRun;
    const imageIndex = galleryOrder[galleryIndex] ?? galleryIndex;
    galleryPolaroid.classList.remove(...galleryEffectClasses);
    void galleryPolaroid.offsetWidth;
    galleryPolaroid.classList.add(effect.className);
    galleryFlapStatus.textContent = effect.status;

    galleryPolaroid.addEventListener(
      "animationend",
      () => {
        if (effectRun !== galleryEffectRun) return;
        galleryPolaroid.classList.remove(effect.className);
        transitionGalleryVersion(imageIndex);
      },
      { once: true }
    );
  }

  function transitionGalleryVersion(imageIndex) {
    const alterEgo = content.galleryAlterEgos?.[imageIndex];
    const currentImageIndex = galleryOrder[galleryIndex] ?? galleryIndex;
    if (!alterEgo || currentImageIndex !== imageIndex) {
      galleryFlapStatus.textContent = "";
      return;
    }

    const versionRun = ++galleryVersionRun;
    const willBeAltered = !galleryAlteredImages.has(imageIndex);
    galleryPolaroid.classList.add("is-version-fading");
    galleryFlapStatus.textContent = "Lima está cambiando de versión…";

    window.setTimeout(() => {
      if (versionRun !== galleryVersionRun) return;
      if (willBeAltered) {
        galleryAlteredImages.add(imageIndex);
      } else {
        galleryAlteredImages.delete(imageIndex);
      }
      applyGalleryVersion(imageIndex);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (versionRun !== galleryVersionRun) return;
          galleryPolaroid.classList.remove("is-version-fading");
          galleryFlapStatus.textContent = willBeAltered
            ? `${alterEgo.label}: ${alterEgo.message}`
            : "Lima volvió a su versión oficial de noticiero.";
        });
      });
    }, 560);

    window.setTimeout(() => {
      if (versionRun === galleryVersionRun) galleryFlapStatus.textContent = "";
    }, 2900);
  }

  function renderGalleryDots() {
    galleryDots.replaceChildren();
    for (let index = 0; index < galleryCount; index += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `gallery-dot${index === galleryIndex ? " is-active" : ""}`;
      dot.setAttribute("aria-label", `Ver foto ${index + 1}`);
      dot.addEventListener("click", () => showGalleryImage(index));
      galleryDots.append(dot);
    }
  }

  function showGalleryImage(index) {
    galleryEffectRun += 1;
    galleryVersionRun += 1;
    galleryPolaroid.classList.remove(...galleryEffectClasses, "is-version-fading");
    galleryIndex = (index + galleryCount) % galleryCount;
    const imageIndex = galleryOrder[galleryIndex] ?? galleryIndex;
    galleryImage.classList.add("is-loading");
    galleryImage.src = galleryPath(imageIndex);
    applyGalleryVersion(imageIndex);
    galleryCounter.textContent = `${galleryIndex + 1} / ${galleryCount}`;
    $$(".gallery-dot", galleryDots).forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === galleryIndex);
    });
  }

  galleryImage.addEventListener("load", () => galleryImage.classList.remove("is-loading"));
  galleryImage.addEventListener("error", () => {
    galleryImage.classList.remove("is-loading");
    galleryCaption.textContent = "Lima está reprogramando esta transmisión. Volvé a intentar en un ratito.";
  });

  async function discoverGallery() {
    if (location.protocol === "file:") {
      galleryOrder = shuffleGallery(galleryCount);
      renderGalleryDots();
      showGalleryImage(0);
      return;
    }
    let found = 0;
    for (let number = 1; number <= 40; number += 1) {
      try {
        const response = await fetch(`./img/lima/${number}.jpg`, { method: "HEAD", cache: "no-store" });
        if (!response.ok) break;
        found = number;
      } catch {
        break;
      }
    }
    if (found > 0) galleryCount = found;
    galleryOrder = shuffleGallery(galleryCount);
    renderGalleryDots();
    showGalleryImage(0);
  }

  $("#gallery-prev").addEventListener("click", () => showGalleryImage(galleryIndex - 1));
  $("#gallery-next").addEventListener("click", () => showGalleryImage(galleryIndex + 1));

  galleryPolaroid.addEventListener("click", playGalleryEffect);

  galleryStage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showGalleryImage(galleryIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showGalleryImage(galleryIndex + 1);
    }
  });

  galleryStage.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
  });
  galleryStage.addEventListener("pointerup", (event) => {
    if (pointerStartX === null) return;
    const distance = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(distance) < 45) return;
    showGalleryImage(galleryIndex + (distance < 0 ? 1 : -1));
  });
  galleryStage.addEventListener("pointercancel", () => {
    pointerStartX = null;
  });

  discoverGallery();
})();
