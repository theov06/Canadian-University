export interface QuizOption {
  label: string;
  weights: Record<string, number>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  category: string;
  options: QuizOption[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1", question: "What kind of problems do you enjoy thinking about?", category: "interests",
    options: [
      { label: "People and behavior", weights: { Psychology: 3, Sociology: 1 } },
      { label: "Society and culture", weights: { Sociology: 3, Anthropology: 2, History: 1 } },
      { label: "Money, markets, and policy", weights: { Economics: 3, "Political Science": 1 } },
      { label: "Communication and media", weights: { Communications: 3, "English/Writing": 1 } },
      { label: "Politics, law, and justice", weights: { "Political Science": 3, Criminology: 2 } },
      { label: "Technology and business", weights: { "Business/Technology": 3, Economics: 1 } },
    ],
  },
  {
    id: "q2", question: "Which task sounds most enjoyable?", category: "strengths",
    options: [
      { label: "Writing essays or stories", weights: { "English/Writing": 3, Philosophy: 1 } },
      { label: "Analyzing data or trends", weights: { Economics: 3, "Business/Technology": 2 } },
      { label: "Helping people solve problems", weights: { Psychology: 3, Sociology: 1 } },
      { label: "Debating social issues", weights: { "Political Science": 3, Philosophy: 2 } },
      { label: "Creating campaigns or content", weights: { Communications: 3, "English/Writing": 1 } },
      { label: "Researching history and culture", weights: { History: 3, Anthropology: 2 } },
    ],
  },
  {
    id: "q3", question: "What are you strongest at?", category: "strengths",
    options: [
      { label: "Writing", weights: { "English/Writing": 3, Communications: 1, Philosophy: 1 } },
      { label: "Presenting and speaking", weights: { Communications: 3, "Political Science": 1 } },
      { label: "Math and data", weights: { Economics: 3, "Business/Technology": 2 } },
      { label: "Listening and empathy", weights: { Psychology: 3, Sociology: 2 } },
      { label: "Critical thinking", weights: { Philosophy: 3, "Political Science": 1, History: 1 } },
      { label: "Creativity", weights: { "English/Writing": 2, Communications: 2, Anthropology: 1 } },
    ],
  },
  {
    id: "q4", question: "What kind of career sounds most appealing?", category: "career",
    options: [
      { label: "Business or finance", weights: { Economics: 3, "Business/Technology": 3 } },
      { label: "Law or government", weights: { "Political Science": 3, Criminology: 2, Philosophy: 1 } },
      { label: "HR, counselling, or social services", weights: { Psychology: 3, Sociology: 2 } },
      { label: "Marketing or media", weights: { Communications: 3, "English/Writing": 1 } },
      { label: "Research or education", weights: { History: 2, Philosophy: 2, Anthropology: 2, Psychology: 1 } },
      { label: "International work or diplomacy", weights: { "International Relations": 3, "Political Science": 1 } },
    ],
  },
  {
    id: "q5", question: "How important is salary potential to you?", category: "career",
    options: [
      { label: "Very important — I want a high-earning career", weights: { Economics: 2, "Business/Technology": 3 } },
      { label: "Somewhat important", weights: { Communications: 1, "Political Science": 1, Psychology: 1 } },
      { label: "Not the main priority — I want meaningful work", weights: { Sociology: 2, Anthropology: 2, Philosophy: 1 } },
    ],
  },
  {
    id: "q6", question: "How important is co-op or hands-on experience?", category: "lifestyle",
    options: [
      { label: "Very important — I want to work while studying", weights: { "Business/Technology": 2, Communications: 1, Economics: 1 } },
      { label: "Nice to have", weights: { Psychology: 1, "Political Science": 1 } },
      { label: "Not important — I prefer academic focus", weights: { Philosophy: 2, History: 2, "English/Writing": 1 } },
    ],
  },
  {
    id: "q7", question: "What study style do you prefer?", category: "strengths",
    options: [
      { label: "Reading and writing", weights: { "English/Writing": 3, History: 2, Philosophy: 2 } },
      { label: "Discussion and debate", weights: { "Political Science": 3, Philosophy: 2, Sociology: 1 } },
      { label: "Data and problem-solving", weights: { Economics: 3, "Business/Technology": 2 } },
      { label: "Projects and presentations", weights: { Communications: 3, "Business/Technology": 1 } },
      { label: "Field and community work", weights: { Anthropology: 3, Sociology: 2, Psychology: 1 } },
    ],
  },
  {
    id: "q8", question: "What environment do you prefer?", category: "lifestyle",
    options: [
      { label: "Big city with lots of opportunities", weights: { Communications: 1, "Business/Technology": 1, Economics: 1 } },
      { label: "Smaller city with lower costs", weights: { Sociology: 1, History: 1, Anthropology: 1 } },
      { label: "Research-focused university", weights: { Psychology: 1, Philosophy: 1, History: 1 } },
      { label: "Teaching-focused or polytechnic", weights: { "Business/Technology": 2, Communications: 1 } },
    ],
  },
  {
    id: "q9", question: "How comfortable are you with heavy reading?", category: "strengths",
    options: [
      { label: "Love it — I read a lot", weights: { "English/Writing": 3, History: 2, Philosophy: 2 } },
      { label: "It's fine, moderate amount", weights: { "Political Science": 1, Sociology: 1, Psychology: 1 } },
      { label: "Prefer less reading, more doing", weights: { "Business/Technology": 2, Communications: 1, Economics: 1 } },
    ],
  },
  {
    id: "q10", question: "Which topic would you pick for a research project?", category: "interests",
    options: [
      { label: "Why people make the decisions they do", weights: { Psychology: 3, Economics: 1 } },
      { label: "How social media shapes public opinion", weights: { Communications: 3, Sociology: 1 } },
      { label: "Income inequality across countries", weights: { Economics: 2, Sociology: 2, "Political Science": 1 } },
      { label: "The history of a social movement", weights: { History: 3, "Political Science": 1, Sociology: 1 } },
      { label: "How different cultures approach justice", weights: { Anthropology: 3, Criminology: 2, Philosophy: 1 } },
      { label: "Building a startup or business plan", weights: { "Business/Technology": 3, Economics: 1 } },
    ],
  },
];
