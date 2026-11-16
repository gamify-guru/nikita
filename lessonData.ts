export type TaskType = "choice" | "fill" | "build";

export interface LessonTask {
  id: string;
  type: TaskType;
  speaker: "teacher" | "ranger";
  prompt: string;
  instruction?: string;
  options?: string[];
  words?: string[];
  answer: string;
  accepted?: string[];
  hint: string;
}

export interface ScanStat {
  value: string;
  label: string;
  present: boolean;
}

export interface Mission {
  id: "india" | "china" | "australia" | "secret";
  number: string;
  zone: string;
  title: string;
  subtitle: string;
  duration: string;
  image: string;
  imagePosition: string;
  accent: string;
  briefing: string;
  stats: ScanStat[];
  tasks: LessonTask[];
}

export const missions: Mission[] = [
  {
    id: "india",
    number: "01",
    zone: "India Zone",
    title: "Река крокодилов",
    subtitle: "Отвечай по опоре и задай 2 своих вопроса",
    duration: "7–8 мин",
    image: "/images/ranger-scanner.jpg",
    imagePosition: "38% center",
    accent: "#e9a23b",
    briefing:
      "Сканер нашёл крокодилов у реки. Сначала ответь рейнджеру, а в конце сам собери два вопроса для сканера.",
    stats: [
      { value: "4", label: "crocodiles · 2 под водой", present: true },
      { value: "6", label: "birds", present: true },
      { value: "0", label: "pandas", present: false },
    ],
    tasks: [
      {
        id: "in-1",
        type: "choice",
        speaker: "teacher",
        prompt: "Are there any crocodiles?",
        instruction: "Выбери короткий ответ.",
        options: ["Yes, there are.", "No, there aren’t.", "Yes, there is."],
        answer: "Yes, there are.",
        hint: "На сканере есть 4 crocodiles.",
      },
      {
        id: "in-2",
        type: "choice",
        speaker: "teacher",
        prompt: "How many crocodiles are there?",
        instruction: "Сколько крокодилов нашёл сканер?",
        options: ["There are two crocodiles.", "There are four crocodiles.", "There aren’t any crocodiles."],
        answer: "There are four crocodiles.",
        hint: "Два крокодила видно, ещё два — под водой.",
      },
      {
        id: "in-3",
        type: "choice",
        speaker: "teacher",
        prompt: "Are there any pandas?",
        instruction: "Посмотри на показание pandas: 0.",
        options: ["Yes, there are.", "No, there aren’t.", "No, there isn’t."],
        answer: "No, there aren’t.",
        hint: "Если животных нет, начни с No.",
      },
      {
        id: "in-4",
        type: "fill",
        speaker: "ranger",
        prompt: "Дополни сообщение сканера.",
        instruction: "There ___ four crocodiles.",
        answer: "are",
        accepted: ["are"],
        hint: "There are + несколько животных.",
      },
      {
        id: "in-5",
        type: "choice",
        speaker: "teacher",
        prompt: "Are there any birds?",
        instruction: "Выбери короткий ответ.",
        options: ["No, there aren’t.", "Yes, there are.", "Yes, they are."],
        answer: "Yes, there are.",
        hint: "Сканер видит 6 birds.",
      },
      {
        id: "in-6",
        type: "fill",
        speaker: "ranger",
        prompt: "Запиши количество птиц словом.",
        instruction: "There are ___ birds.",
        answer: "six",
        accepted: ["six", "6"],
        hint: "6 = six",
      },
      {
        id: "in-7",
        type: "build",
        speaker: "ranger",
        prompt: "Твой вопрос сканеру: спроси про крокодилов.",
        instruction: "Нажимай на слова по порядку.",
        words: ["crocodiles", "any", "Are", "there", "?"],
        answer: "Are there any crocodiles?",
        hint: "Начни с Are there any…?",
      },
      {
        id: "in-8",
        type: "build",
        speaker: "ranger",
        prompt: "Теперь сам спроси про панд.",
        instruction: "Собери вопрос без подсказки порядка.",
        words: ["pandas", "there", "?", "any", "Are"],
        answer: "Are there any pandas?",
        hint: "Are + there + any + pandas + ?",
      },
    ],
  },
  {
    id: "china",
    number: "02",
    zone: "China Zone",
    title: "Бамбуковый лес",
    subtitle: "Выбирай ответы и дополняй фразы",
    duration: "7–8 мин",
    image: "/images/ranger-scanner.jpg",
    imagePosition: "65% center",
    accent: "#54a875",
    briefing:
      "Сканер переключается на бамбуковый лес. Здесь живут две панды. Исправь помехи в записях: выбери или впиши нужные слова.",
    stats: [
      { value: "2", label: "pandas", present: true },
      { value: "8", label: "birds", present: true },
      { value: "0", label: "crocodiles", present: false },
    ],
    tasks: [
      {
        id: "ch-1",
        type: "choice",
        speaker: "teacher",
        prompt: "Are there any pandas?",
        instruction: "Выбери верный короткий ответ.",
        options: ["No, there aren’t.", "Yes, there are.", "Yes, there is."],
        answer: "Yes, there are.",
        hint: "На экране: 2 pandas.",
      },
      {
        id: "ch-2",
        type: "choice",
        speaker: "teacher",
        prompt: "Are there any crocodiles?",
        instruction: "Выбери верный короткий ответ.",
        options: ["Yes, there are.", "No, there aren’t.", "No, there don’t."],
        answer: "No, there aren’t.",
        hint: "Crocodiles: 0.",
      },
      {
        id: "ch-3",
        type: "fill",
        speaker: "ranger",
        prompt: "Восстанови запись о количестве.",
        instruction: "There are ___ pandas.",
        answer: "two",
        accepted: ["two", "2"],
        hint: "2 = two",
      },
      {
        id: "ch-4",
        type: "fill",
        speaker: "ranger",
        prompt: "Дополни отрицание.",
        instruction: "There ___ any crocodiles.",
        answer: "aren’t",
        accepted: ["aren't", "aren’t", "are not"],
        hint: "There are → There aren’t.",
      },
      {
        id: "ch-5",
        type: "choice",
        speaker: "teacher",
        prompt: "How many birds are there?",
        instruction: "Выбери полный ответ.",
        options: ["There are eight birds.", "There are any birds.", "There is eight birds."],
        answer: "There are eight birds.",
        hint: "8 = eight; birds — множественное число.",
      },
      {
        id: "ch-6",
        type: "fill",
        speaker: "ranger",
        prompt: "Дополни вопрос о количестве.",
        instruction: "How ___ are there?",
        answer: "many",
        accepted: ["many"],
        hint: "How many…? означает «Сколько…?».",
      },
      {
        id: "ch-7",
        type: "choice",
        speaker: "teacher",
        prompt: "Are there any birds?",
        instruction: "Выбери ответ и посмотри на birds: 8.",
        options: ["Yes, there are.", "No, there aren’t.", "Yes, it is."],
        answer: "Yes, there are.",
        hint: "Если животные есть — Yes.",
      },
      {
        id: "ch-8",
        type: "fill",
        speaker: "ranger",
        prompt: "Закончи фразу про крокодилов.",
        instruction: "There aren’t ___ crocodiles.",
        answer: "any",
        accepted: ["any"],
        hint: "В отрицании используем any.",
      },
    ],
  },
  {
    id: "australia",
    number: "03",
    zone: "Australia Zone",
    title: "Долина кенгуру",
    subtitle: "Строй вопросы сам и отвечай рейнджеру",
    duration: "7–8 мин",
    image: "/images/ranger-scanner.jpg",
    imagePosition: "88% center",
    accent: "#d8844f",
    briefing:
      "Последняя обычная зона. Теперь ты ведёшь сканирование: собери четыре вопроса и ответь на четыре вопроса рейнджера.",
    stats: [
      { value: "2", label: "kangaroos", present: true },
      { value: "3", label: "birds", present: true },
      { value: "0", label: "foxes", present: false },
    ],
    tasks: [
      {
        id: "au-1",
        type: "build",
        speaker: "ranger",
        prompt: "Спроси сканер, есть ли здесь кенгуру.",
        words: ["any", "kangaroos", "Are", "?", "there"],
        answer: "Are there any kangaroos?",
        hint: "Are there any + животные + ?",
      },
      {
        id: "au-2",
        type: "choice",
        speaker: "teacher",
        prompt: "Are there any kangaroos?",
        instruction: "Ответь рейнджеру.",
        options: ["Yes, there are.", "No, there aren’t.", "Yes, there aren’t."],
        answer: "Yes, there are.",
        hint: "Kangaroos: 2.",
      },
      {
        id: "au-3",
        type: "build",
        speaker: "ranger",
        prompt: "Спроси, сколько здесь кенгуру.",
        words: ["there", "How", "are", "many", "kangaroos", "?"],
        answer: "How many kangaroos are there?",
        hint: "How many + kangaroos + are there?",
      },
      {
        id: "au-4",
        type: "fill",
        speaker: "teacher",
        prompt: "How many kangaroos are there?",
        instruction: "There are ___ kangaroos.",
        answer: "two",
        accepted: ["two", "2"],
        hint: "На сканере: 2.",
      },
      {
        id: "au-5",
        type: "build",
        speaker: "ranger",
        prompt: "Спроси, есть ли здесь лисы.",
        words: ["foxes", "there", "any", "?", "Are"],
        answer: "Are there any foxes?",
        hint: "Are there any foxes?",
      },
      {
        id: "au-6",
        type: "choice",
        speaker: "teacher",
        prompt: "Are there any foxes?",
        instruction: "Дай короткий ответ.",
        options: ["No, there aren’t.", "Yes, there are.", "No, there are."],
        answer: "No, there aren’t.",
        hint: "Foxes: 0.",
      },
      {
        id: "au-7",
        type: "build",
        speaker: "ranger",
        prompt: "Спроси про птиц в этой зоне.",
        words: ["?", "any", "birds", "there", "Are"],
        answer: "Are there any birds?",
        hint: "Начни с Are there…",
      },
      {
        id: "au-8",
        type: "fill",
        speaker: "teacher",
        prompt: "How many birds are there?",
        instruction: "There are ___ birds.",
        answer: "three",
        accepted: ["three", "3"],
        hint: "3 = three",
      },
    ],
  },
  {
    id: "secret",
    number: "04",
    zone: "Secret Zone",
    title: "Секретная зона",
    subtitle: "Финальное сканирование без готовых вопросов",
    duration: "10–12 мин",
    image: "/images/secret-zone.jpg",
    imagePosition: "center",
    accent: "#26b8c9",
    briefing:
      "Новый сигнал! В Секретной зоне живут лисы, птицы и паук. Задай четыре вопроса и ответь на четыре вопроса старшего рейнджера.",
    stats: [
      { value: "2", label: "foxes", present: true },
      { value: "5", label: "birds", present: true },
      { value: "1", label: "spider", present: true },
      { value: "0", label: "pandas", present: false },
    ],
    tasks: [
      {
        id: "se-1",
        type: "build",
        speaker: "ranger",
        prompt: "Твой первый вопрос: спроси про лис.",
        words: ["any", "?", "foxes", "there", "Are"],
        answer: "Are there any foxes?",
        hint: "Are there any foxes?",
      },
      {
        id: "se-2",
        type: "choice",
        speaker: "teacher",
        prompt: "Are there any foxes?",
        options: ["Yes, there are.", "No, there aren’t.", "Yes, there is."],
        answer: "Yes, there are.",
        hint: "На сканере две лисы.",
      },
      {
        id: "se-3",
        type: "build",
        speaker: "ranger",
        prompt: "Спроси, сколько в зоне лис.",
        words: ["foxes", "are", "How", "there", "many", "?"],
        answer: "How many foxes are there?",
        hint: "How many foxes are there?",
      },
      {
        id: "se-4",
        type: "fill",
        speaker: "teacher",
        prompt: "How many foxes are there?",
        instruction: "There are ___ foxes.",
        answer: "two",
        accepted: ["two", "2"],
        hint: "2 = two",
      },
      {
        id: "se-5",
        type: "build",
        speaker: "ranger",
        prompt: "Спроси, есть ли в Секретной зоне панды.",
        words: ["pandas", "there", "?", "Are", "any"],
        answer: "Are there any pandas?",
        hint: "Are there any + pandas?",
      },
      {
        id: "se-6",
        type: "choice",
        speaker: "teacher",
        prompt: "Are there any pandas?",
        options: ["No, there aren’t.", "Yes, there are.", "No, there isn’t."],
        answer: "No, there aren’t.",
        hint: "Pandas: 0.",
      },
      {
        id: "se-7",
        type: "build",
        speaker: "ranger",
        prompt: "Спроси про птиц на ветке.",
        words: ["there", "birds", "any", "Are", "?"],
        answer: "Are there any birds?",
        hint: "Are there any birds?",
      },
      {
        id: "se-8",
        type: "choice",
        speaker: "teacher",
        prompt: "How many birds are there?",
        options: ["There are five birds.", "There are two birds.", "There aren’t any birds."],
        answer: "There are five birds.",
        hint: "Посчитай птиц на ветке: 5 = five.",
      },
    ],
  },
];

export const ruleCards = [
  {
    id: "question",
    number: "01",
    title: "Вопрос Are there any…?",
    short: "Спроси, есть ли где-то несколько предметов или животных.",
    lines: ["Are there any birds?", "Are there any pandas?", "Are there any crocodiles?"],
    examples: [
      { image: "australia", text: "Are there any kangaroos?", answer: "Yes, there are." },
      { image: "india", text: "Are there any crocodiles?", answer: "Yes, there are." },
    ],
  },
  {
    id: "answers",
    number: "02",
    title: "Короткие ответы",
    short: "Да — есть. Нет — их там нет.",
    lines: ["Yes, there are.", "No, there aren’t."],
    examples: [
      { image: "china", text: "Are there any pandas?", answer: "Yes, there are." },
      { image: "australia", text: "Are there any foxes?", answer: "No, there aren’t." },
    ],
  },
  {
    id: "how-many",
    number: "03",
    title: "How many are there?",
    short: "Спроси о количестве и назови его в ответе.",
    lines: [
      "How many are there?",
      "There are twenty birds.",
      "There are three pandas.",
      "There are some kangaroos.",
      "There aren’t any foxes.",
    ],
    examples: [
      { image: "india", text: "How many crocodiles are there?", answer: "There are four crocodiles." },
      { image: "china", text: "How many pandas are there?", answer: "There are two pandas." },
    ],
  },
] as const;

export const homeworkOne = [
  { id: "hw1-1", prompt: "Are there any books?", answer: "Yes, there are.", accepted: ["yes there are"], hint: "На полке 5 книг." },
  { id: "hw1-2", prompt: "How many books are there?", answer: "There are five books.", accepted: ["there are five books", "there are 5 books"], hint: "5 = five" },
  { id: "hw1-3", prompt: "Are there any cats?", answer: "No, there aren’t.", accepted: ["no there arent", "no there are not"], hint: "Кошек в комнате нет." },
  { id: "hw1-4", prompt: "How many balls are there?", answer: "There are two balls.", accepted: ["there are two balls", "there are 2 balls"], hint: "2 = two" },
  { id: "hw1-5", prompt: "Are there any pencils?", answer: "Yes, there are.", accepted: ["yes there are"], hint: "В стакане есть карандаши." },
  { id: "hw1-6", prompt: "How many pencils are there?", answer: "There are twelve pencils.", accepted: ["there are twelve pencils", "there are 12 pencils"], hint: "12 = twelve" },
  { id: "hw1-7", prompt: "Are there any birds?", answer: "No, there aren’t.", accepted: ["no there arent", "no there are not"], hint: "Птиц в комнате нет." },
  { id: "hw1-8", prompt: "Complete: There aren’t ___ cats.", answer: "any", accepted: ["any", "there arent any cats"], hint: "После aren’t используем any." },
];
