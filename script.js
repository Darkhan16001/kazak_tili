
"use strict";

// ==========================================
// QAZAQ TILI — BY DARKHAN
// ҚАЗАҚ КИНОСЫ • ДЕФИС • ТАСЫМАЛ
// 80 МИНУТ • 24 ОҚУШЫ • 3 КОМАНДА
// ==========================================

const $ = id => document.getElementById(id);

const STORAGE = "qazaq_kino_emle_darkhan_v1";
const TOTAL_PAGES = 16;

// Жалпы уақыт: 80 минут
const PAGE_MINUTES = [
  3,                 // 0. Кіріспе
  4, 4, 4, 4, 4, 4,  // 1–6. Түсіндіру
  6,                 // 7. YouTube
  13,                // 8. Конспект
  3,                 // 9. Қатысушылар
  12,                // 10. Ауызша
  8,                 // 11. Жеке тест
  4, 3, 2,           // 12–14. Үш ойын
  2                  // 15. Қорытынды
];

// ==========================================
// 1. ОҚУШЫЛАР
// ==========================================

const STUDENT_NAMES = [
  "Рамазан",
  "Тұрғанжан",
  "Нұрай",
  "Әлқуат",
  "Шырай",
  "Гүлсезім",
  "Маржан",
  "Мариям",
  "Жансая",
  "Азиза",
  "Ақсезім",
  "Нұрболсын",
  "Ақнұр",
  "Іңкәр",
  "Асхат",
  "Аяжан",
  "Мирас",
  "Санжар",
  "Ерасыл",
  "Нұрасыл",
  "Расул",
  "Айнұр",
  "Дархан",
  "Айкерім"
];

const TEAM_NAMES = [
  "🎬 Кино тарихшылары",
  "✍️ Емле шеберлері",
  "📖 Тасымал білгірлері"
];

// ==========================================
// 2. САҚТАУ ЖҮЙЕСІ
// ==========================================

function initialState() {
  return {
    page: 0,
    startedAt: null,
    pageEnteredAt: null,

    students: STUDENT_NAMES.map((name, id) => ({
      id,
      name,
      present: true
    })),

    oral: {},
    quiz: {},
    battle: {},
    logic: {},
    creative: {},

    oralSelected: null,
    quizSelected: null,
    battleIndex: 0
  };
}

let state = initialState();

try {
  const saved = JSON.parse(
    localStorage.getItem(STORAGE) || "null"
  );

  if (
    saved &&
    Array.isArray(saved.students) &&
    saved.students.length === 24
  ) {
    state = {
      ...initialState(),
      ...saved
    };
  }
} catch (error) {
  console.warn("Сақталған мәлімет оқылмады:", error);
}

for (const key of [
  "oral",
  "quiz",
  "battle",
  "logic",
  "creative"
]) {
  if (
    !state[key] ||
    typeof state[key] !== "object" ||
    Array.isArray(state[key])
  ) {
    state[key] = {};
  }
}

function save() {
  try {
    localStorage.setItem(
      STORAGE,
      JSON.stringify(state)
    );
  } catch (error) {
    console.warn("Сақтау қатесі:", error);
  }
}

function has(object, key) {
  return Object.prototype.hasOwnProperty.call(
    object,
    key
  );
}

function safe(value) {
  return String(value).replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]
  );
}

// ==========================================
// 3. ҚАТЫСУШЫЛАР МЕН КОМАНДАЛАР
// ==========================================

function presentStudents() {
  return state.students.filter(
    student => student.present
  );
}

function teamCount() {
  return Math.min(3, presentStudents().length);
}

function studentTeam(id) {
  const students = presentStudents();

  const index = students.findIndex(
    student => student.id === id
  );

  if (index === -1 || !teamCount()) {
    return -1;
  }

  return index % teamCount();
}

function membersOf(team) {
  return presentStudents().filter(
    student => studentTeam(student.id) === team
  );
}

// ==========================================
// 4. РАНДОМ ТАҢДАУ
// ==========================================

function randomFrom(items) {
  if (!items.length) return null;

  return items[
    Math.floor(Math.random() * items.length)
  ];
}

function usedQuestions(results) {
  return Object.values(results)
    .map(item => item.questionIndex)
    .filter(Number.isInteger);
}

function availableQuestions(bank, results) {
  const used = new Set(usedQuestions(results));

  return bank
    .map((item, index) => index)
    .filter(index => !used.has(index));
}

// ==========================================
// 5. БЕТТЕРДІ АУЫСТЫРУ
// ==========================================

function goTo(page) {
  page = Number(page);

  if (
    !Number.isInteger(page) ||
    page < 0 ||
    page >= TOTAL_PAGES
  ) {
    return;
  }

  // Сабақтың жалпы уақыты басталады
  if (!state.startedAt) {
    state.startedAt = Date.now();
  }

  // Видео бетінен шықса, ойнатуды тоқтату
  if (state.page === 7 && page !== 7) {
    stopVideo();
  }

  if (
    state.page !== page ||
    !state.pageEnteredAt
  ) {
    state.pageEnteredAt = Date.now();
  }

  state.page = page;

  for (let i = 0; i < TOTAL_PAGES; i++) {
    const screen = $("page-" + i);
    const active = i === page;

    screen.hidden = !active;
    screen.classList.toggle("active", active);
  }

  document.querySelectorAll(".nav-btn")
    .forEach(button => {
      button.classList.toggle(
        "active",
        Number(button.dataset.page) === page
      );
    });

  $("pageIndicator").textContent =
    `${page + 1} / ${TOTAL_PAGES}`;

  $("previousPage").disabled = page === 0;

  $("nextPage").disabled =
    page === TOTAL_PAGES - 1;

  $("nextPage").textContent =
    page === TOTAL_PAGES - 2
      ? "Қорытынды →"
      : "Келесі →";

  save();
  refresh();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

window.goTo = goTo;

document.querySelectorAll(".nav-btn")
  .forEach(button => {
    button.addEventListener("click", () => {
      goTo(Number(button.dataset.page));
    });
  });

$("previousPage").addEventListener("click", () => {
  goTo(state.page - 1);
});

$("nextPage").addEventListener("click", () => {
  goTo(state.page + 1);
});

// ==========================================
// 6. 80 МИНУТТЫҚ ТАЙМЕР
// ==========================================

function formatTime(seconds) {
  seconds = Math.max(0, Math.floor(seconds));

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainder).padStart(2, "0")
  );
}

function updateClock() {
  const now = Date.now();

  const elapsed = state.startedAt
    ? Math.floor((now - state.startedAt) / 1000)
    : 0;

  const sectionElapsed = state.pageEnteredAt
    ? Math.floor(
        (now - state.pageEnteredAt) / 1000
      )
    : 0;

  const limit = PAGE_MINUTES[state.page] * 60;

  const remaining = Math.max(
    0,
    limit - sectionElapsed
  );

  $("lessonClock").textContent =
    formatTime(elapsed);

  $("sectionClock").textContent =
    formatTime(remaining);

  $("lessonClock").style.color =
    elapsed >= 4800
      ? "#ffd17d"
      : "#68dfb5";

  $("sectionClock").style.color =
    sectionElapsed >= limit
      ? "#ff788c"
      : "#68dfb5";
}

setInterval(updateClock, 1000);

// ==========================================
// 7. ТОЛЫҚ ЭКРАН
// ==========================================

$("fullscreenBtn").addEventListener(
  "click",
  async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement
          .requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      alert(
        "Толық экран режимі ашылмады."
      );
    }
  }
);

// ==========================================
// 8. ЖАҢА ҚЫСҚА ВИДЕОЛАР
// ==========================================

// Үш тексерілген YouTube бейнесабағы.
//
// 1) Қазақ киносының тарихы
// 2) Дефис арқылы жазылатын сөздер
// 3) Буын және тасымал
//
// Әрқайсысының алғашқы 2 минуты.
// Барлығы: 6 минут.

const VIDEOS = [
  {
    id: "graQfeQ4XsI",
    title: "Қазақ киносының тарихы",
    start: 0,
    end: 120
  },
  {
    id: "2KiUbFLBzYU",
    title: "Дефис арқылы жазылатын сөздер",
    start: 0,
    end: 120
  },
  {
    id: "uIltk-VkPj4",
    title: "Буын және тасымал",
    start: 0,
    end: 120
  }
];

function playVideo(index) {
  const video = VIDEOS[index];

  if (!video) return;

  const player = $("videoPlayer");

  // YouTube ішіндегі қысқа үзінді
  player.src =
    "https://www.youtube-nocookie.com/embed/" +
    video.id +
    "?start=" + video.start +
    "&end=" + video.end +
    "&rel=0" +
    "&playsinline=1";

  const duration = video.end - video.start;

  $("videoTitle").textContent =
    "▶ " + video.title +
    " — " + formatTime(duration);

  $("videoExternal").href =
    "https://www.youtube.com/watch?v=" +
    video.id +
    "&t=" + video.start + "s";
}

function stopVideo() {
  $("videoPlayer").src = "about:blank";

  $("videoTitle").textContent =
    "⏹ Видео тоқтатылды.";
}

document.querySelectorAll("[data-video]")
  .forEach(button => {
    button.addEventListener("click", () => {
      playVideo(Number(button.dataset.video));
    });
  });

$("stopVideo").addEventListener(
  "click",
  stopVideo
);

// ==========================================
// 9. ҚАТЫСУШЫЛАРДЫ БАСҚАРУ
// ==========================================

function gamesStarted() {
  return (
    Object.keys(state.battle).length > 0 ||
    Object.keys(state.logic).length > 0 ||
    Object.keys(state.creative).length > 0
  );
}

function beforeRosterChange() {
  if (!gamesStarted()) return true;

  const confirmed = confirm(
    "Қатысушылар өзгерсе, командалар " +
    "қайта бөлінеді.\n\n" +
    "Командалық ойын ұпайлары тазаланады. " +
    "Жеке бағалар сақталады.\n\n" +
    "Жалғастырамыз ба?"
  );

  if (!confirmed) return false;

  state.battle = {};
  state.logic = {};
  state.creative = {};
  state.battleIndex = 0;

  return true;
}

function fixSelections() {
  const active = presentStudents();

  if (
    state.oralSelected &&
    !active.some(
      s => s.id === state.oralSelected.studentId
    )
  ) {
    state.oralSelected = null;
  }

  if (
    state.quizSelected &&
    !active.some(
      s => s.id === state.quizSelected.studentId
    )
  ) {
    state.quizSelected = null;
  }
}

function attendanceChanged() {
  fixSelections();
  save();
  refresh();

  const count = presentStudents().length;

  $("attendanceFeedback").textContent =
    `✅ Қатысады: ${count}. ` +
    `Қатыспайды: ${24 - count}.`;
}

function setPresence(id, present) {
  const student = state.students[id];

  if (
    !student ||
    student.present === present
  ) {
    return;
  }

  if (!beforeRosterChange()) return;

  student.present = present;
  attendanceChanged();
}

function renderAttendance() {
  const active = presentStudents();

  const absent = state.students.filter(
    student => !student.present
  );

  $("presentCount").textContent = active.length;
  $("absentCount").textContent = absent.length;
  $("teamCount").textContent = teamCount();

  $("presentList").innerHTML =
    active.map(student => `
      <div class="student-row">

        <span class="student-number">
          ${student.id + 1}.
        </span>

        <input
          type="text"
          maxlength="60"
          data-name="${student.id}"
          value="${safe(student.name)}"
          aria-label="Оқушының аты"
        >

        <button
          class="small-danger"
          data-absent="${student.id}">
          ✕ Алып тастау
        </button>

      </div>
    `).join("");

  $("absentList").innerHTML =
    absent.length
      ? absent.map(student => `
          <div class="absent-row">

            <span>${safe(student.name)}</span>

            <button
              class="small-success"
              data-restore="${student.id}">
              ↩ Қайтару
            </button>

          </div>
        `).join("")
      : "<p>Қатыспайтын оқушылар жоқ.</p>";

  // Сабаққа келмегенді алып тастау
  document.querySelectorAll("[data-absent]")
    .forEach(button => {
      button.addEventListener("click", () => {
        setPresence(
          Number(button.dataset.absent),
          false
        );
      });
    });

  // Қайта қосу
  document.querySelectorAll("[data-restore]")
    .forEach(button => {
      button.addEventListener("click", () => {
        setPresence(
          Number(button.dataset.restore),
          true
        );
      });
    });

  // Есімді өзгерту
  document.querySelectorAll("[data-name]")
    .forEach(input => {
      input.addEventListener("change", () => {
        const id = Number(input.dataset.name);
        const name = input.value.trim();

        if (!name) {
          input.value = state.students[id].name;
          return;
        }

        state.students[id].name = name;

        save();
        renderTeamRoster();
        renderOral();
        renderQuiz();
        renderScores();
      });
    });
}

$("allPresent").addEventListener("click", () => {
  if (
    !state.students.some(
      student => !student.present
    )
  ) {
    return;
  }

  if (!beforeRosterChange()) return;

  state.students.forEach(student => {
    student.present = true;
  });

  attendanceChanged();
});

function renderTeamRoster() {
  if (!teamCount()) {
    $("teamRoster").innerHTML =
      '<div class="card">Қатысушылар жоқ.</div>';
    return;
  }

  $("teamRoster").innerHTML =
    TEAM_NAMES.slice(0, teamCount())
      .map((name, team) => `
        <div class="team-card">
          <h3>${name}</h3>

          <p>
            ${membersOf(team).length} оқушы
          </p>

          <ol>
            ${membersOf(team)
              .map(student => `
                <li>${safe(student.name)}</li>
              `).join("")}
          </ol>
        </div>
      `).join("");
}

// ==========================================
// 10. КҮРДЕЛІ АУЫЗША СҰРАҚТАР
// ==========================================

const ORAL = [
  {
    q: "Қазақ киносын ұлттық тарих пен мәдениетті танытатын өнер деп неліктен атаймыз?",
    a: "Кино тарихи оқиғаларды, тұлғаларды, халық тұрмысын, салт-дәстүрді және ұлттық құндылықтарды көркем түрде бейнелейді."
  },
  {
    q: "1938 жылғы «Амангелді» фильмінің қазақ киносы тарихындағы маңызы қандай?",
    a: "Бұл фильм ұлттық көркем киноның қалыптасуындағы маңызды туындылардың бірі."
  },
  {
    q: "Тарихи фильм мен деректі фильмнің негізгі айырмашылығын түсіндір.",
    a: "Тарихи көркем фильм сценарий мен актерлік ойынға сүйенеді. Деректі фильм нақты адамдарды, оқиғалар мен материалдарды тіркеуге бағытталады."
  },
  {
    q: "«Қыз Жібек» фильмінде қандай ұлттық мәдени құндылықтар бейнеленеді?",
    a: "Халық эпосы, дәстүрлі киімдер, музыка, әдет-ғұрып және қоғамдық қатынастар бейнеленеді."
  },
  {
    q: "«Менің атым Қожа» фильмінің тәрбиелік маңызын түсіндір.",
    a: "Фильм баланың мінезі, тәрбиесі, жауапкершілігі және өзін өзгертуге ұмтылысы туралы ой қозғайды."
  },
  {
    q: "Шәкен Аймановтың қазақ киносының дамуына қосқан үлесін сипатта.",
    a: "Шәкен Айманов актер әрі режиссер ретінде ұлттық кинематографияның дамуына ықпал еткен көрнекті тұлға."
  },
  {
    q: "Неліктен тарихи фильмдегі әрбір оқиғаны нақты тарихи дерек ретінде қабылдауға болмайды?",
    a: "Көркем фильмде сценарийлік өзгерістер, ойдан құрастырылған диалогтар және көркемдік қиял болуы мүмкін."
  },
  {
    q: "Киноның ұлттық тілді дамытуға қандай ықпалы бар?",
    a: "Кино әдеби тілдің, сөйлеу мәдениетінің, ұлттық сөз қолданысының кең аудиторияға таралуына ықпал етеді."
  },
  {
    q: "Дефис пен сызықшаның айырмашылығын мысалмен түсіндір.",
    a: "Дефис — орфографиялық таңба: салт-дәстүр. Сызықша — тыныс белгісі: Кино — өнер."
  },
  {
    q: "Қосарлама қос сөз бен қайталама қос сөзді салыстыр.",
    a: "Қосарлама қос сөз екі түрлі сыңардан тұрады: ата-ана. Қайталама қос сөзде сөз қайталанады: қайта-қайта."
  },
  {
    q: "«Салт-дәстүр» сөзінде дефис қойылуының себебі қандай?",
    a: "Ол екі сыңардан жасалған қосарлама қос сөз болғандықтан дефис арқылы жазылады."
  },
  {
    q: "Күшейткіш буын арқылы жасалған үш сөзге мысал келтір.",
    a: "Қып-қызыл, жап-жасыл, әп-әдемі."
  },
  {
    q: "«Қып-қызыл» мен «аппақ» сөздерінің жазылу ерекшелігін түсіндір.",
    a: "Қып-қызыл дефиспен жазылады, ал аппақ қалыптасқан орфографиялық норма бойынша бірге жазылады."
  },
  {
    q: "Араб цифры және рим цифры арқылы жазылған реттік атаулардың айырмашылығын түсіндір.",
    a: "Араб цифрымен жазылса дефис қойылады: 1-курс. Рим цифрынан кейін дефис қойылмайды: ІІ курс."
  },
  {
    q: "Болжалдық сан есімдерді дефис арқылы жазуға үш мысал келтір.",
    a: "Екі-үш, бес-алты, отыз-қырық."
  },
  {
    q: "БҰҰ сияқты қысқарған атауға қосымша қалай жалғанады?",
    a: "Бас әріптен қысқарған атауға қосымша дефис арқылы жалғанады: БҰҰ-ға."
  },
  {
    q: "«Қазақ киносы — ұлттық мұра» сөйлеміндегі сызықшаның қызметін анықта.",
    a: "Атау тұлғалы бастауыш пен баяндауыш арасында сызықша қойылып тұр."
  },
  {
    q: "Тасымал дегеніміз не және ол қандай негізгі ережеге сүйенеді?",
    a: "Тасымал — жолға сыймаған сөздің бөлігін келесі жолға көшіру. Негізінен буын жігіне сүйенеді."
  },
  {
    q: "Бір буынды сөздер неге тасымалданбайды?",
    a: "Бір буынды сөздің ішінде тасымалдауға жарайтын буын шегі болмайды."
  },
  {
    q: "«Ана» сөзінің «а-на» түрінде тасымалдануы неге дұрыс емес?",
    a: "Бір әріпті жол соңында немесе келесі жолда жеке қалдыруға болмайды."
  },
  {
    q: "«Кино», «қазақ», «сахна» сөздерін дұрыс тасымалда.",
    a: "Ки-но, қа-зақ, сах-на."
  },
  {
    q: "Қысқарған сөздердің тасымалдану ерекшелігін түсіндір.",
    a: "БҰҰ сияқты бас әріптерден құралған қысқарған сөздер тасымалданбайды."
  },
  {
    q: "Кісі атының қысқартылған әрпі мен тегін екі жолға бөлуге бола ма?",
    a: "Жоқ. Мысалы, А. Құнанбайұлы тіркесіндегі инициал мен текті ажыратып тасымалдауға болмайды."
  },
  {
    q: "Кино туралы сөйлем құрап, ондағы дефис пен сызықшаның қызметін түсіндір.",
    a: "Мысал: «Қазақ киносы — ұлттық өнер. Ол салт-дәстүрді танытады». Сызықша сөйлемде, дефис қос сөзде қолданылған."
  }
];

// ==========================================
// 11. АУЫЗША РАНДОМ ТАҢДАУ
// ==========================================

function oralRemaining() {
  return presentStudents().filter(
    student => !has(state.oral, student.id)
  );
}

function renderOral() {
  const active = presentStudents();
  const remaining = oralRemaining();

  const selection = state.oralSelected;

  const student = selection
    ? active.find(
        s => s.id === selection.studentId
      )
    : null;

  const selected = Boolean(student);

  const graded = selected &&
    has(state.oral, student.id);

  $("oralProgressText").textContent =
    `${active.length - remaining.length} / ` +
    `${active.length} бағаланды`;

  $("oralPick").disabled =
    !active.length ||
    (selected && !graded) ||
    remaining.length === 0;

  $("oralPick").textContent =
    remaining.length
      ? "🎲 Рандом таңдау"
      : "✅ Барлығы аяқталды";

  $("oralReveal").disabled = !selected;

  document.querySelectorAll(".oral-grade")
    .forEach(button => {
      button.disabled = !selected || graded;
    });

  if (!selected) {
    $("oralStudent").textContent =
      active.length
        ? "🎲 Кездейсоқ оқушы"
        : "Қатысушылар жоқ";

    $("oralQuestion").textContent =
      remaining.length
        ? "Рандом батырмасын бас."
        : "Барлық оқушы жауап берді.";

    $("oralAnswer").textContent = "";
    $("oralAnswer").hidden = true;

    $("oralFeedback").textContent =
      `${remaining.length} оқушы қалды.`;
  } else {
    const question =
      ORAL[selection.questionIndex];

    $("oralStudent").textContent =
      "🎤 " + student.name;

    $("oralQuestion").textContent =
      question.q;

    $("oralAnswer").textContent =
      "Жауап үлгісі: " + question.a;

    $("oralAnswer").hidden = !graded;

    $("oralFeedback").textContent =
      graded
        ? `${student.name}: ` +
          `${state.oral[student.id].points} / 3 ұпай`
        : "Оқушының жауабын тыңдап, бағала.";
  }

  $("oralResults").innerHTML =
    active.map(student => `
      <div class="progress-person">
        <span>${safe(student.name)}</span>

        <b>
          ${has(state.oral, student.id)
            ? state.oral[student.id].points + " / 3"
            : "Кезекте"}
        </b>
      </div>
    `).join("");
}

$("oralPick").addEventListener("click", () => {
  const current = state.oralSelected;

  if (current) {
    const id = current.studentId;

    if (
      presentStudents().some(s => s.id === id) &&
      !has(state.oral, id)
    ) {
      $("oralFeedback").textContent =
        "Алдымен таңдалған оқушыға баға қой.";
      return;
    }
  }

  const students = oralRemaining();

  const questions = availableQuestions(
    ORAL,
    state.oral
  );

  if (!students.length || !questions.length) {
    state.oralSelected = null;
  } else {
    const student = randomFrom(students);

    state.oralSelected = {
      studentId: student.id,
      questionIndex: randomFrom(questions)
    };
  }

  save();
  renderOral();
});

$("oralReveal").addEventListener("click", () => {
  if (!state.oralSelected) return;

  $("oralAnswer").hidden =
    !$("oralAnswer").hidden;
});

document.querySelectorAll(".oral-grade")
  .forEach(button => {
    button.addEventListener("click", () => {
      const selection = state.oralSelected;

      if (!selection) return;

      const id = selection.studentId;

      if (
        has(state.oral, id) ||
        !presentStudents().some(s => s.id === id)
      ) {
        return;
      }

      state.oral[id] = {
        points: Number(button.dataset.points),
        questionIndex: selection.questionIndex
      };

      save();

      renderOral();
      renderScores();
    });
  });

// ==========================================
// 12. 24 ЖЕКЕ ТЕСТ
// ==========================================

const QUIZ = [
  {
    q: "1938 жылы жарық көрген маңызды қазақ көркем фильмі қайсы?",
    options: [
      "Қыз Жібек",
      "Амангелді",
      "Менің атым Қожа",
      "Тақиялы періште"
    ],
    answer: 1,
    why: "«Амангелді» 1938 жылы түсірілген."
  },
  {
    q: "«Менің атым Қожа» фильмінің режиссері кім?",
    options: [
      "Шәкен Айманов",
      "Сұлтан Қожықов",
      "Абдолла Қарсақбаев",
      "Ораз Әбішев"
    ],
    answer: 2,
    why: "Фильмді Абдолла Қарсақбаев түсірген."
  },
  {
    q: "«Қыз Жібек» фильмі қай туындыға негізделген?",
    options: [
      "Халық эпосына",
      "Ғылыми кітапқа",
      "Заңдар жинағына",
      "Газет мақаласына"
    ],
    answer: 0,
    why: "«Қыз Жібек» халықтың лиро-эпостық мұрасы негізінде түсірілген."
  },
  {
    q: "Тарихи фильмді ғылыми талдаудың дұрыс тәсілі?",
    options: [
      "Барлық көріністі нақты дерек деп қабылдау",
      "Тек актердің пікіріне сену",
      "Тарихи құжаттарды ескермеу",
      "Фильмді тарихи дерекпен салыстыру"
    ],
    answer: 3,
    why: "Көркем фильмдегі оқиғалар нақты дерекпен әрдайым бірдей бола бермейді."
  },
  {
    q: "Бердібек Соқпақбаев шығармасына негізделген фильмді таңда.",
    options: [
      "Менің атым Қожа",
      "Амангелді",
      "Қыз Жібек",
      "Тақиялы періште"
    ],
    answer: 0,
    why: "«Менің атым Қожа» повесінің негізінде фильм түсірілген."
  },
  {
    q: "Алматы кинохроника студиясы қай жылы құрылды?",
    options: [
      "1920",
      "1934",
      "1970",
      "1991"
    ],
    answer: 1,
    why: "Алматы кинохроника студиясы 1934 жылы құрылды."
  },
  {
    q: "Қай сөз дұрыс жазылған?",
    options: [
      "салт дәстүр",
      "салтдәстүр",
      "салт-дәстүр",
      "салт — дәстүр"
    ],
    answer: 2,
    why: "Қосарлама қос сөз дефиспен жазылады."
  },
  {
    q: "Қайсысы қайталама қос сөз?",
    options: [
      "қайта-қайта",
      "кинотеатр",
      "қазақ киносы",
      "тарихи фильм"
    ],
    answer: 0,
    why: "Қайта-қайта — қайталама қос сөз."
  },
  {
    q: "Күшейткіш буынның дұрыс жазылуы?",
    options: [
      "қып қызыл",
      "қыпқызыл",
      "қып — қызыл",
      "қып-қызыл"
    ],
    answer: 3,
    why: "Қып-қызыл сөзі дефис арқылы жазылады."
  },
  {
    q: "Қай сөз дефиссіз жазылады?",
    options: [
      "жап-жасыл",
      "аппақ",
      "ата-ана",
      "қайта-қайта"
    ],
    answer: 1,
    why: "Аппақ сөзі бірге жазылады."
  },
  {
    q: "Араб цифрымен дұрыс жазылған нұсқа?",
    options: [
      "5-сынып",
      "5 сынып",
      "5—сынып",
      "5сынып"
    ],
    answer: 0,
    why: "Реттік мәнді цифрдан кейін дефис қойылады."
  },
  {
    q: "Рим цифрымен дұрыс жазылған нұсқа?",
    options: [
      "ІІ-курс",
      "ІІ—курс",
      "ІІ курс",
      "ІІкурс"
    ],
    answer: 2,
    why: "Рим цифрынан кейін дефис қойылмайды."
  },
  {
    q: "Болжалдық сан есімнің дұрыс жазылуы?",
    options: [
      "бес алты",
      "бес-алты",
      "бесалты",
      "бес — алты"
    ],
    answer: 1,
    why: "Болжалдық сан есімдер дефиспен жазылады."
  },
  {
    q: "Қай сөйлемде сызықша қойылған?",
    options: [
      "Ата-ана жиналды.",
      "Жап-жасыл бақ көрінді.",
      "Бес-алты оқушы келді.",
      "Кино — ұлттық өнер."
    ],
    answer: 3,
    why: "Кино — ұлттық өнер сөйлемінде сызықша қолданылған."
  },
  {
    q: "Қысқарған атауға қосымша дұрыс жалғанған нұсқа?",
    options: [
      "БҰҰ-ға",
      "БҰҰға",
      "БҰҰ ға",
      "БҰҰ—ға"
    ],
    answer: 0,
    why: "Бас әріптен қысқарған атауға қосымша дефиспен жалғанады."
  },
  {
    q: "Қай жалқы есім дұрыс жазылған?",
    options: [
      "әл Фараби",
      "әлФараби",
      "әл-Фараби",
      "әл — Фараби"
    ],
    answer: 2,
    why: "Әл-Фараби есімінің қалыптасқан жазылымында дефис бар."
  },
  {
    q: "Кино сөзінің дұрыс тасымалы?",
    options: [
      "к-ино",
      "кин-о",
      "кино-",
      "ки-но"
    ],
    answer: 3,
    why: "Сөз екі буыннан тұрады: ки-но."
  },
  {
    q: "Қазақ сөзінің дұрыс тасымалы?",
    options: [
      "қ-азақ",
      "қа-зақ",
      "қаз-ақ",
      "қаза-қ"
    ],
    answer: 1,
    why: "Қазақ сөзі қа-зақ түрінде тасымалданады."
  },
  {
    q: "Сахна сөзінің дұрыс тасымалы?",
    options: [
      "сах-на",
      "са-хна",
      "сахн-а",
      "с-ахна"
    ],
    answer: 0,
    why: "Сахна сөзі сах-на түрінде бөлінеді."
  },
  {
    q: "Қай сөз тасымалданбайды?",
    options: [
      "сахна",
      "қазақ",
      "кино",
      "фильм"
    ],
    answer: 3,
    why: "Фильм — бір буынды сөз."
  },
  {
    q: "Бір әріпті бөлек қалдырғандықтан қай тасымал қате?",
    options: [
      "ки-но",
      "сах-на",
      "а-на",
      "қа-зақ"
    ],
    answer: 2,
    why: "Бір әріпті жеке жолда қалдыруға болмайды."
  },
  {
    q: "БҰҰ сөзін қалай тасымалдаймыз?",
    options: [
      "Б-ҰҰ",
      "Тасымалдамаймыз",
      "БҰ-Ұ",
      "Бір әрпін бөлеміз"
    ],
    answer: 1,
    why: "Бас әріптен қысқарған сөздерді бөлмейміз."
  },
  {
    q: "Кісі атының қысқартылған әрпі мен тегі туралы дұрыс пікір?",
    options: [
      "Оларды ажыратып тасымалдауға болмайды",
      "Әріпті жалғыз қалдыру керек",
      "Тек текті бөлу міндетті",
      "Инициалды ортасынан бөлу керек"
    ],
    answer: 0,
    why: "Инициал мен тегі тасымалдау кезінде ажыратылмайды."
  },
  {
    q: "Дефис пен тасымал таңбасының айырмашылығы неде?",
    options: [
      "Екеуі де үнемі сөз құрамында сақталады",
      "Тасымал таңбасы тек жалқы есімде болады",
      "Қос сөз дефисі жазудан алынып тасталады",
      "Дефис тұрақты, тасымал таңбасы жолға байланысты"
    ],
    answer: 3,
    why: "Қос сөздің дефисі тұрақты, тасымал таңбасы жол соңында қойылады."
  }
];

// ==========================================
// 13. ЖЕКЕ ТЕСТТІ РАНДОМ ТАҢДАУ
// ==========================================

function quizRemaining() {
  return presentStudents().filter(
    student => !has(state.quiz, student.id)
  );
}

function renderQuiz() {
  const active = presentStudents();
  const remaining = quizRemaining();

  const selection = state.quizSelected;

  const student = selection
    ? active.find(
        s => s.id === selection.studentId
      )
    : null;

  const selected = Boolean(student);

  const done = selected &&
    has(state.quiz, student.id);

  $("quizProgressText").textContent =
    `${active.length - remaining.length} / ` +
    `${active.length} тапсырды`;

  $("quizPick").disabled =
    !active.length ||
    (selected && !done) ||
    remaining.length === 0;

  $("quizPick").textContent =
    remaining.length
      ? "🎲 Рандом таңдау"
      : "✅ Барлығы аяқталды";

  $("quizCheck").disabled = !selected || done;

  if (!selected) {
    $("quizStudent").textContent =
      active.length
        ? "🎲 Кездейсоқ оқушы"
        : "Қатысушылар жоқ";

    $("quizQuestion").textContent =
      remaining.length
        ? "Рандом батырмасын бас."
        : "Барлық тест аяқталды.";

    $("quizOptions").innerHTML = "";

    $("quizFeedback").textContent =
      `${remaining.length} оқушы қалды.`;
  } else {
    const question =
      QUIZ[selection.questionIndex];

    const result =
      state.quiz[student.id];

    $("quizStudent").textContent =
      "🧠 " + student.name;

    $("quizQuestion").textContent =
      question.q;

    $("quizOptions").innerHTML =
      question.options.map((option, index) => {
        const checked = done &&
          result.selected === index;

        const css = done
          ? index === question.answer
            ? "correct"
            : checked ? "wrong" : ""
          : "";

        return `
          <label class="choice ${css}">
            <input
              type="radio"
              name="quizAnswer"
              value="${index}"
              ${checked ? "checked" : ""}
              ${done ? "disabled" : ""}
            >

            <span>
              ${String.fromCharCode(65 + index)}.
              ${safe(option)}
            </span>
          </label>
        `;
      }).join("");

    $("quizFeedback").textContent =
      done
        ? (
            result.correct
              ? "✅ Дұрыс! +2 ұпай. "
              : "❌ Қате. "
          ) + question.why
        : "Бір жауапты таңда.";
  }

  $("quizResults").innerHTML =
    active.map(student => `
      <div class="progress-person">
        <span>${safe(student.name)}</span>

        <b>
          ${has(state.quiz, student.id)
            ? state.quiz[student.id].points + " / 2"
            : "Кезекте"}
        </b>
      </div>
    `).join("");
}

$("quizPick").addEventListener("click", () => {
  const current = state.quizSelected;

  if (current) {
    const id = current.studentId;

    if (
      presentStudents().some(s => s.id === id) &&
      !has(state.quiz, id)
    ) {
      $("quizFeedback").textContent =
        "Алдымен осы оқушының тестін тексер.";
      return;
    }
  }

  const students = quizRemaining();

  const questions = availableQuestions(
    QUIZ,
    state.quiz
  );

  if (!students.length || !questions.length) {
    state.quizSelected = null;
  } else {
    const student = randomFrom(students);

    state.quizSelected = {
      studentId: student.id,
      questionIndex: randomFrom(questions)
    };
  }

  save();
  renderQuiz();
});

$("quizCheck").addEventListener("click", () => {
  const selection = state.quizSelected;

  if (!selection) return;

  const id = selection.studentId;

  if (
    has(state.quiz, id) ||
    !presentStudents().some(s => s.id === id)
  ) {
    return;
  }

  const selected = document.querySelector(
    'input[name="quizAnswer"]:checked'
  );

  if (!selected) {
    $("quizFeedback").textContent =
      "Алдымен жауапты таңда.";
    return;
  }

  const answer = Number(selected.value);

  const question =
    QUIZ[selection.questionIndex];

  const correct =
    answer === question.answer;

  state.quiz[id] = {
    questionIndex: selection.questionIndex,
    selected: answer,
    correct,
    points: correct ? 2 : 0
  };

  save();
  renderQuiz();
  renderScores();
});

// ==========================================
// 14. 1-ОЙЫН — CINEMA BATTLE
// ==========================================

const BATTLE = [
  {
    q: "«Қазақ киносы — қазақ тарихы» тақырыбындағы таңба қандай?",
    options: [
      "Дефис",
      "Сызықша",
      "Үтір",
      "Қос нүкте"
    ],
    answer: 1,
    why: "Бұл жерде сөйлем мүшелерінің арасына сызықша қойылған."
  },
  {
    q: "Редактор үш сөзді қате жазды: «салт дәстүр», «қайта қайта», «1 курс». Дұрысын таңда.",
    options: [
      "салтдәстүр, қайтақайта, 1курс",
      "салт — дәстүр, қайта — қайта, 1 курс",
      "салт-дәстүр, қайта-қайта, 1-курс",
      "салт дәстүр, қайта-қайта, 1курс"
    ],
    answer: 2,
    why: "Қос сөздер және цифрмен берілген реттік тұлғалар дефиспен жазылады."
  },
  {
    q: "Тарихи фильм туралы қай пікір ғылыми тұрғыдан қате?",
    options: [
      "Фильмнің режиссерін зерттеуге болады",
      "Фильмнің түсірілген жылын анықтауға болады",
      "Фильмдегі әрбір диалог міндетті түрде тарихи дерек",
      "Фильмді құжатпен салыстыруға болады"
    ],
    answer: 2,
    why: "Көркем фильмде ойдан құрастырылған диалогтар болуы мүмкін."
  },
  {
    q: "«Кино» сөзін дұрыс тасымалда.",
    options: [
      "к-ино",
      "ки-но",
      "кин-о",
      "кино-"
    ],
    answer: 1,
    why: "Кино сөзі ки-но түрінде тасымалданады."
  },
  {
    q: "Күшейткіш буын арқылы жасалған дұрыс сөзді таңда.",
    options: [
      "қып-қызыл",
      "қыпқызыл",
      "қып қызыл",
      "қып — қызыл"
    ],
    answer: 0,
    why: "Қып-қызыл сөзі дефиспен жазылады."
  },
  {
    q: "Қай сөз тасымалданбайды?",
    options: [
      "қазақ",
      "сахна",
      "фильм",
      "кино"
    ],
    answer: 2,
    why: "Фильм — бір буынды сөз."
  },
  {
    q: "«ІІ-курс» жазылымындағы қатені анықта.",
    options: [
      "Рим цифрынан кейін дефис қойылмайды",
      "Курс сөзін жазуға болмайды",
      "Рим цифры қолданылмайды",
      "Сөз тырнақшада болуы тиіс"
    ],
    answer: 0,
    why: "Дұрыс нұсқа: ІІ курс."
  },
  {
    q: "«А-на» деп тасымалдау қай ережені бұзады?",
    options: [
      "Қос сөздердің емлесін",
      "Бас әріп ережесін",
      "Сызықша ережесін",
      "Бір әріпті жеке қалдырмау ережесін"
    ],
    answer: 3,
    why: "Бір әріпті жеке қалдыруға болмайды."
  },
  {
    q: "Қай сөйлемде тұрақты емле дефисі қолданылған?",
    options: [
      "Ки-но деп тасымалдадық.",
      "Қазақ киносы — өнер.",
      "Фильмде салт-дәстүр көрсетілді.",
      "Қа-зақ сөзін бөлдік."
    ],
    answer: 2,
    why: "Салт-дәстүр қос сөзінде дефис тұрақты жазылады."
  }
];

function battleLength() {
  return teamCount() * 3;
}

function battleTeam(index) {
  return teamCount()
    ? index % teamCount()
    : -1;
}

function renderBattle() {
  const length = battleLength();

  if (!length) {
    $("battleNumber").textContent = "0 / 0";
    $("battleTeam").textContent = "Команда жоқ";

    $("battleQuestion").textContent =
      "Алдымен қатысушыларды белгіле.";

    $("battleOptions").innerHTML = "";
    $("battleBar").style.width = "0%";

    $("battleCheck").disabled = true;
    $("battleNext").disabled = true;

    $("battleFeedback").textContent = "";
    return;
  }

  const index = Math.max(
    0,
    Math.min(
      length - 1,
      Number(state.battleIndex) || 0
    )
  );

  state.battleIndex = index;

  const question = BATTLE[index];

  const done = has(state.battle, index);

  const result = state.battle[index];

  $("battleNumber").textContent =
    `Жағдаят ${index + 1} / ${length}`;

  $("battleTeam").textContent =
    TEAM_NAMES[battleTeam(index)];

  $("battleQuestion").textContent =
    question.q;

  $("battleBar").style.width =
    `${(index + 1) / length * 100}%`;

  $("battleOptions").innerHTML =
    question.options.map((option, i) => {
      const checked =
        done && result.selected === i;

      const css = done
        ? i === question.answer
          ? "correct"
          : checked ? "wrong" : ""
        : "";

      return `
        <label class="choice ${css}">

          <input
            type="radio"
            name="battleAnswer"
            value="${i}"
            ${checked ? "checked" : ""}
            ${done ? "disabled" : ""}
          >

          <span>
            ${String.fromCharCode(65 + i)}.
            ${safe(option)}
          </span>

        </label>
      `;
    }).join("");

  $("battleCheck").disabled = done;
  $("battleNext").disabled = false;

  $("battleNext").textContent =
    index === length - 1
      ? "2-ойынға өту →"
      : "Келесі жағдаят →";

  $("battleFeedback").textContent =
    done
      ? (
          result.correct
            ? "✅ Дұрыс! +3 ұпай. "
            : "❌ Қате. "
        ) + question.why
      : "Командамен талқылап, жауап таңдаңдар.";
}

$("battleCheck").addEventListener("click", () => {
  const index = state.battleIndex;

  if (
    !teamCount() ||
    index >= battleLength() ||
    has(state.battle, index)
  ) {
    return;
  }

  const selected = document.querySelector(
    'input[name="battleAnswer"]:checked'
  );

  if (!selected) {
    $("battleFeedback").textContent =
      "Алдымен жауапты таңда.";
    return;
  }

  const answer = Number(selected.value);

  const correct =
    answer === BATTLE[index].answer;

  state.battle[index] = {
    selected: answer,
    correct,
    points: correct ? 3 : 0
  };

  save();
  renderBattle();
  renderScores();
});

$("battleNext").addEventListener("click", () => {
  if (!teamCount()) return;

  if (
    state.battleIndex >= battleLength() - 1
  ) {
    goTo(13);
    return;
  }

  state.battleIndex++;
  save();
  renderBattle();
});

// ==========================================
// 15. 2-ОЙЫН — ЕМЛЕ ДЕТЕКТИВІ
// ==========================================

const LOGIC = [
  [
    {
      text: "«Амангелді» фильмі 1938 жылы жарық көрген.",
      correct: true,
      why: "Бұл — қазақ киносы тарихындағы маңызды туынды."
    },
    {
      text: "Тарихи фильмдегі барлық диалог нақты құжаттан алынады.",
      correct: false,
      why: "Көркем фильмдегі диалогтар сценарийге сай жасалуы мүмкін."
    },
    {
      text: "«Қыз Жібек» халық эпосына негізделген.",
      correct: true,
      why: "Фильм халықтың лиро-эпостық мұрасына негізделген."
    },
    {
      text: "Кино ұлттық мәдениетті таныта алмайды.",
      correct: false,
      why: "Кино ұлттық мәдениетті насихаттайтын маңызды өнер."
    }
  ],

  [
    {
      text: "«Ата-ана» сөзі дефиспен жазылады.",
      correct: true,
      why: "Ата-ана — қосарлама қос сөз."
    },
    {
      text: "«Қып-қызыл» күшейткіш буын арқылы жасалған.",
      correct: true,
      why: "Қып- — күшейткіш буын."
    },
    {
      text: "«Аппақ» сөзін «ап-ақ» деп жазу дұрыс.",
      correct: false,
      why: "Аппақ сөзі бірге жазылады."
    },
    {
      text: "«ІІ-курс» — рим цифрымен дұрыс жазылған түр.",
      correct: false,
      why: "Дұрысы: ІІ курс."
    }
  ],

  [
    {
      text: "«Кино» сөзі ки-но түрінде тасымалданады.",
      correct: true,
      why: "Ки-но — дұрыс буын жігі."
    },
    {
      text: "«Фильм» сөзін бөліп тасымалдауға болады.",
      correct: false,
      why: "Фильм — бір буынды сөз."
    },
    {
      text: "БҰҰ сияқты қысқарған сөз бөлінбейді.",
      correct: true,
      why: "Бас әріптерден қысқарған сөздер тасымалданбайды."
    },
    {
      text: "«А-на» түрінде бір әріпті жолда қалдыруға болады.",
      correct: false,
      why: "Бір әріпті жеке қалдыруға болмайды."
    }
  ]
];

function renderLogic() {
  if (!teamCount()) {
    $("logicArea").innerHTML =
      '<div class="card">Қатысушылар жоқ.</div>';
    return;
  }

  $("logicArea").innerHTML =
    LOGIC.slice(0, teamCount())
      .map((items, team) => {
        const result = state.logic[team];
        const done = Boolean(result);

        const rows = items.map((item, i) => {
          const value = done
            ? String(result.answers[i])
            : "";

          return `
            <div class="statement">

              <p>
                <b>${i + 1}.</b>
                ${safe(item.text)}
              </p>

              <select
                data-logic="${team}-${i}"
                ${done ? "disabled" : ""}>

                <option value="">
                  Жауап таңда
                </option>

                <option
                  value="true"
                  ${value === "true"
                    ? "selected"
                    : ""}>
                  ✅ Дұрыс
                </option>

                <option
                  value="false"
                  ${value === "false"
                    ? "selected"
                    : ""}>
                  ❌ Қате
                </option>

              </select>
            </div>
          `;
        }).join("");

        const explanations = done
          ? items.map((item, i) => `
              <p>
                ${i + 1}.

                <b>
                  ${result.answers[i] === item.correct
                    ? "✅"
                    : "❌"}
                </b>

                ${safe(item.why)}
              </p>
            `).join("")
          : "";

        return `
          <div class="logic-panel">

            <h3>${TEAM_NAMES[team]}</h3>

            <p>
              Тұжырымдарды ғылыми
              негізде талдаңдар.
            </p>

            ${rows}

            <button
              class="btn primary"
              data-logic-check="${team}"
              ${done ? "disabled" : ""}>
              🕵️ Жауаптарды тексеру
            </button>

            <p
              class="feedback"
              id="logicFeedback-${team}">
              ${done
                ? result.points + " / 4 ұпай"
                : ""}
            </p>

            ${done
              ? `
                <div class="answer-panel">
                  ${explanations}
                </div>
              `
              : ""}

          </div>
        `;
      }).join("");

  document.querySelectorAll("[data-logic-check]")
    .forEach(button => {
      button.addEventListener("click", () => {
        const team =
          Number(button.dataset.logicCheck);

        if (has(state.logic, team)) return;

        const items = LOGIC[team];

        const fields = items.map((item, i) =>
          document.querySelector(
            `[data-logic="${team}-${i}"]`
          )
        );

        if (
          fields.some(
            field => field.value === ""
          )
        ) {
          $("logicFeedback-" + team).textContent =
            "Төрт жауапты түгел таңдаңдар.";
          return;
        }

        const answers = fields.map(
          field => field.value === "true"
        );

        const points = answers.reduce(
          (sum, answer, i) =>
            sum + Number(
              answer === items[i].correct
            ),
          0
        );

        state.logic[team] = {
          answers,
          points
        };

        save();
        renderLogic();
        renderScores();
      });
    });
}

// ==========================================
// 16. 3-ОЙЫН — ШЫҒАРМАШЫЛЫҚ ТАПСЫРМА
// ==========================================

const CREATIVE = [
  {
    title: "🎬 Кинотанушы",
    task:
      "Қазақ киносының тарихи маңызы " +
      "туралы 4 сөйлемдік мәтін жазыңдар. " +
      "Бір тарихи фильмді атаңдар, " +
      "бір сызықша және бір дефиспен " +
      "жазылатын сөз қолданыңдар.",
    rubric:
      "2 ұпай — мазмұн; " +
      "2 ұпай — емле; " +
      "1 ұпай — қорғау."
  },
  {
    title: "✍️ Мәтін редакторы",
    task:
      "Қате жазылған сөздерді түзетіңдер: " +
      "«салт дәстүр», «қайта қайта», " +
      "«5 сынып», «ІІ-курс», «ап-ақ». " +
      "Әр түзетудің себебін түсіндіріңдер.",
    rubric:
      "2 ұпай — дұрыс жазу; " +
      "2 ұпай — ережені түсіндіру; " +
      "1 ұпай — дәлел."
  },
  {
    title: "📖 Тасымал шебері",
    task:
      "«Кино», «қазақ», «сахна», «көркем» " +
      "сөздерін дұрыс тасымалдаңдар. " +
      "«Фильм», «ана», «БҰҰ» сөздерін " +
      "неліктен тасымалдауға болмайтынын " +
      "түсіндіріңдер.",
    rubric:
      "2 ұпай — тасымал; " +
      "2 ұпай — ережелер; " +
      "1 ұпай — түсіндіру."
  }
];

function renderCreative() {
  if (!teamCount()) {
    $("creativeArea").innerHTML =
      '<div class="card">Қатысушылар жоқ.</div>';
    return;
  }

  $("creativeArea").innerHTML =
    CREATIVE.slice(0, teamCount())
      .map((task, team) => {
        const score = has(state.creative, team)
          ? state.creative[team]
          : null;

        return `
          <div class="creative-panel">

            <h3>${TEAM_NAMES[team]}</h3>
            <h3>${safe(task.title)}</h3>

            <p>${safe(task.task)}</p>

            <p>
              <b>Бағалау:</b>
              ${safe(task.rubric)}
            </p>

            <label for="creative-${team}">
              0–5 ұпай
            </label>

            <select id="creative-${team}">
              <option value="">
                Ұпай таңда
              </option>

              ${[0, 1, 2, 3, 4, 5]
                .map(n => `
                  <option
                    value="${n}"
                    ${score === n
                      ? "selected"
                      : ""}>
                    ${n} ұпай
                  </option>
                `).join("")}
            </select>

            <button
              class="btn success"
              data-creative-save="${team}">
              🏅 Ұпайды сақтау
            </button>

            <p
              class="feedback"
              id="creativeFeedback-${team}">
              ${score === null
                ? "Әлі бағаланған жоқ."
                : score + " / 5 ұпай сақталды."}
            </p>

          </div>
        `;
      }).join("");

  document.querySelectorAll("[data-creative-save]")
    .forEach(button => {
      button.addEventListener("click", () => {
        const team =
          Number(button.dataset.creativeSave);

        const value =
          $("creative-" + team).value;

        if (value === "") {
          $("creativeFeedback-" + team).textContent =
            "Алдымен ұпай таңда.";
          return;
        }

        state.creative[team] = Number(value);

        save();
        renderCreative();
        renderScores();
      });
    });
}

// ==========================================
// 17. ҰПАЙ ЕСЕПТЕУ
// ==========================================

function personalPoints(id) {
  const oral = has(state.oral, id)
    ? Number(state.oral[id].points) || 0
    : 0;

  const quiz = has(state.quiz, id)
    ? Number(state.quiz[id].points) || 0
    : 0;

  return oral + quiz;
}

function gamePoints(team) {
  let points = 0;

  for (
    let index = 0;
    index < battleLength();
    index++
  ) {
    if (
      battleTeam(index) === team &&
      has(state.battle, index)
    ) {
      points +=
        Number(state.battle[index].points) || 0;
    }
  }

  if (has(state.logic, team)) {
    points +=
      Number(state.logic[team].points) || 0;
  }

  if (has(state.creative, team)) {
    points +=
      Number(state.creative[team]) || 0;
  }

  return points;
}

function teamPoints(team) {
  const members = membersOf(team);

  if (!members.length) return 0;

  const personalSum = members.reduce(
    (sum, student) =>
      sum + personalPoints(student.id),
    0
  );

  // Командалардағы оқушылар саны
  // әртүрлі болуы мүмкін.
  //
  // Сондықтан жеке ұпайлардың
  // орташа нәтижесін қолданамыз.

  const average = personalSum / members.length;

  const individualContribution =
    Math.round(average * 2);

  return individualContribution +
    gamePoints(team);
}

function scoreCards() {
  return TEAM_NAMES.slice(0, teamCount())
    .map((name, team) => `
      <div class="team-card">

        <h3>${name}</h3>

        <div class="team-score">
          ${teamPoints(team)} ұпай
        </div>

        <p>
          ${membersOf(team).length} оқушы
        </p>

        <p>
          Командалық ойындар:
          ${gamePoints(team)} ұпай
        </p>

      </div>
    `).join("");
}

function renderScores() {
  const cards = scoreCards();

  $("game1Scores").innerHTML = cards;
  $("game2Scores").innerHTML = cards;
  $("game3Scores").innerHTML = cards;
  $("finalScores").innerHTML = cards;

  // Ұпайларды тек тапсырмалар кезінде көрсету
  $("sidebarScores").innerHTML =
    state.page < 9
      ? ""
      : TEAM_NAMES.slice(0, teamCount())
          .map((name, team) => `
            <div class="mini-score">
              <span>${name}</span>
              <b>${teamPoints(team)}</b>
            </div>
          `).join("");

  renderFinal();
}

// ==========================================
// 18. ЖЕҢІМПАЗДЫ АНЫҚТАУ
// ==========================================

function renderFinal() {
  const active = presentStudents();

  if (!active.length) {
    $("winner").textContent =
      "Қатысушылар белгіленбеген.";

    $("studentResults").innerHTML = "";
    return;
  }

  const scores = Array.from(
    { length: teamCount() },
    (_, team) => teamPoints(team)
  );

  const maximum = Math.max(...scores);

  const winners = scores
    .map((score, index) => ({
      score,
      index
    }))
    .filter(item => item.score === maximum);

  const assessed =
    active.some(student =>
      has(state.oral, student.id) ||
      has(state.quiz, student.id)
    ) ||
    gamesStarted();

  if (!assessed) {
    $("winner").textContent =
      "Нәтижелер тапсырмалардан кейін шығады.";
  } else if (winners.length === 1) {
    $("winner").innerHTML =
      "🏆 ЖЕҢІМПАЗ КОМАНДА" +
      "<br>" +
      TEAM_NAMES[winners[0].index] +
      "<br>" +
      maximum + " ұпай";
  } else {
    $("winner").innerHTML =
      "🤝 ҰПАЙЛАР ТЕҢ" +
      "<br>" +
      winners.map(
        item => TEAM_NAMES[item.index]
      ).join(" және ") +
      "<br>" +
      maximum + " ұпай";
  }

  $("studentResults").innerHTML =
    active.map(student => {
      const id = student.id;

      const oral = has(state.oral, id)
        ? state.oral[id].points
        : "—";

      const quiz = has(state.quiz, id)
        ? state.quiz[id].points
        : "—";

      return `
        <tr>
          <td>${safe(student.name)}</td>

          <td>
            ${TEAM_NAMES[studentTeam(id)]}
          </td>

          <td>${oral}</td>

          <td>${quiz}</td>

          <td>
            <b>${personalPoints(id)}</b>
          </td>
        </tr>
      `;
    }).join("");
}

// ==========================================
// 19. КОНСПЕКТІ КӨШІРУ
// ==========================================

$("copyNotes").addEventListener(
  "click",
  async () => {
    const text = $("notesContent").innerText;

    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(text);
      } else {
        const area =
          document.createElement("textarea");

        area.value = text;

        area.style.position = "fixed";
        area.style.opacity = "0";

        document.body.appendChild(area);

        area.select();

        const success =
          document.execCommand("copy");

        area.remove();

        if (!success) {
          throw new Error("Көшіру қатесі");
        }
      }

      alert("✅ Конспект көшірілді!");
    } catch (error) {
      alert(
        "Конспектіні қолмен белгілеп көшір."
      );
    }
  }
);

// ==========================================
// 20. ЖАҢА САБАҚ
// ==========================================

$("resetLesson").addEventListener(
  "click",
  () => {
    const confirmed = confirm(
      "Жаңа сабақ бастаймыз ба?\n\n" +
      "Барлық бағалар мен қатысу белгілері " +
      "тазаланады."
    );

    if (!confirmed) return;

    state = initialState();

    save();
    stopVideo();

    goTo(0);
  }
);

// ==========================================
// 21. БАРЛЫҚ БЕТТІ ЖАҢАРТУ
// ==========================================

function refresh() {
  renderAttendance();
  renderTeamRoster();

  renderOral();
  renderQuiz();

  renderBattle();
  renderLogic();
  renderCreative();

  renderScores();
  updateClock();
}

// ==========================================
// 22. САЙТТЫ БАСТАУ
// ==========================================

function initialize() {
  const page = Math.max(
    0,
    Math.min(
      TOTAL_PAGES - 1,
      Number(state.page) || 0
    )
  );

  goTo(page);
}

initialize();

// ==========================================
// MADE BY DARKHAN
// ==========================================

