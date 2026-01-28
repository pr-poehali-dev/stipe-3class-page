import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface Quiz {
  question: string;
  options: string[];
  correct: number;
}

interface Subject {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  quizzes: Quiz[];
}

const subjects: Subject[] = [
  {
    id: 'math',
    title: '📐 Математика',
    icon: 'Calculator',
    description: 'Учим умножение и деление, решаем задачи, играем с числами!',
    color: 'from-red-400 to-pink-500',
    quizzes: [
      { question: 'Сколько будет 7 × 8?', options: ['54', '56', '64', '48'], correct: 1 },
      { question: 'Реши: 48 ÷ 6 = ?', options: ['6', '7', '8', '9'], correct: 2 },
      { question: 'У Маши 15 яблок, она съела 3. Сколько осталось?', options: ['12', '13', '11', '14'], correct: 0 }
    ]
  },
  {
    id: 'russian',
    title: '📝 Русский язык',
    icon: 'BookOpen',
    description: 'Правописание безударных гласных, части речи, интересные диктанты',
    color: 'from-blue-400 to-cyan-500',
    quizzes: [
      { question: 'Какая буква пропущена: в_сна?', options: ['и', 'е', 'о', 'а'], correct: 3 },
      { question: 'Найди существительное:', options: ['бежать', 'синий', 'дом', 'быстро'], correct: 2 },
      { question: 'Сколько слогов в слове "компьютер"?', options: ['2', '3', '4', '5'], correct: 1 }
    ]
  },
  {
    id: 'reading',
    title: '📚 Чтение',
    icon: 'Book',
    description: 'Сказки, рассказы, стихи — читаем и обсуждаем вместе!',
    color: 'from-green-400 to-emerald-500',
    quizzes: [
      { question: 'Кто автор сказки "Конёк-Горбунок"?', options: ['Пушкин', 'Ершов', 'Толстой', 'Чуковский'], correct: 1 },
      { question: 'Как зовут главного героя "Незнайки"?', options: ['Незнайка', 'Знайка', 'Пончик', 'Винтик'], correct: 0 },
      { question: 'Что такое рифма?', options: ['Начало строки', 'Созвучие концов строк', 'Название книги', 'Автор стиха'], correct: 1 }
    ]
  },
  {
    id: 'world',
    title: '🌍 Окружающий мир',
    icon: 'Globe',
    description: 'Природа, животные, наша планета — узнаём новое!',
    color: 'from-yellow-400 to-orange-500',
    quizzes: [
      { question: 'Сколько планет в Солнечной системе?', options: ['7', '8', '9', '10'], correct: 1 },
      { question: 'Какое животное — хищник?', options: ['Корова', 'Волк', 'Заяц', 'Олень'], correct: 1 },
      { question: 'Что растения выделяют на свету?', options: ['Углекислый газ', 'Кислород', 'Азот', 'Водород'], correct: 1 }
    ]
  },
  {
    id: 'craft',
    title: '✂️ Труд',
    icon: 'Scissors',
    description: 'Поделки из бумаги, аппликации, рукоделие — творим сами!',
    color: 'from-purple-400 to-pink-500',
    quizzes: [
      { question: 'Что нужно для аппликации?', options: ['Клей и бумага', 'Молоток', 'Пила', 'Компьютер'], correct: 0 },
      { question: 'Как называется японское искусство складывания бумаги?', options: ['Икебана', 'Оригами', 'Каратэ', 'Сумо'], correct: 1 },
      { question: 'Какой материал лучше для поделки из природных материалов?', options: ['Пластик', 'Шишки и листья', 'Металл', 'Стекло'], correct: 1 }
    ]
  },
  {
    id: 'pe',
    title: '⚽ Физкультура',
    icon: 'Activity',
    description: 'Зарядка, игры, спорт — будь здоровым и сильным!',
    color: 'from-red-500 to-orange-600',
    quizzes: [
      { question: 'Сколько игроков в футбольной команде на поле?', options: ['9', '10', '11', '12'], correct: 2 },
      { question: 'Какое упражнение развивает гибкость?', options: ['Бег', 'Растяжка', 'Прыжки', 'Метание'], correct: 1 },
      { question: 'Что нужно делать перед тренировкой?', options: ['Поесть много', 'Разминку', 'Лечь спать', 'Ничего'], correct: 1 }
    ]
  }
];

export default function Index() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentQuizIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
  };

  const handleAnswerSubmit = () => {
    if (!selectedSubject || selectedAnswer === '') return;

    const currentQuiz = selectedSubject.quizzes[currentQuizIndex];
    const isCorrect = parseInt(selectedAnswer) === currentQuiz.correct;

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (!selectedSubject) return;

    if (currentQuizIndex < selectedSubject.quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer('');
      setShowResult(false);
    } else {
      setSelectedSubject(null);
    }
  };

  const currentQuiz = selectedSubject?.quizzes[currentQuizIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-purple-200 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, #1E90FF 0px, #1E90FF 1px, transparent 1px, transparent 20px),
                           repeating-linear-gradient(90deg, #1E90FF 0px, #1E90FF 1px, transparent 1px, transparent 20px)`,
        }}
      />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="text-center mb-12 space-y-4">
          <h1 
            className="text-6xl font-bold text-red-600 animate-shake"
            style={{ 
              textShadow: '3px 3px 0 #FFD700, 6px 6px 0 #FF4444',
              letterSpacing: '2px'
            }}
          >
            🚀 Stype — 3 класс 🚀
          </h1>
          <p 
            className="text-2xl italic text-blue-900 font-semibold animate-blink"
            style={{ textShadow: '2px 2px 4px rgba(255, 215, 0, 0.5)' }}
          >
            Учимся с радостью перед весенними каникулами 2026!
          </p>
        </header>

        <nav className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl p-6 shadow-2xl border-4 border-blue-800">
            <div className="flex flex-wrap justify-center gap-4">
              {subjects.map((subject) => (
                <Button
                  key={subject.id}
                  onClick={() => handleSubjectClick(subject)}
                  className="bg-white/20 hover:bg-orange-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg border-2 border-white/50"
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  {subject.title}
                </Button>
              ))}
            </div>
          </div>
        </nav>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => (
            <Card
              key={subject.id}
              className="animate-bounce-in cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl border-4 border-blue-300 bg-gradient-to-br from-white to-blue-50"
              onClick={() => handleSubjectClick(subject)}
              style={{
                animationDelay: `${index * 0.1}s`,
                boxShadow: 'inset 0 -4px 0 rgba(30, 144, 255, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div className={`h-2 bg-gradient-to-r ${subject.color} rounded-t-lg`} />
              <CardHeader>
                <CardTitle className="text-2xl text-red-600 border-b-2 border-dashed border-blue-400 pb-2 flex items-center gap-2">
                  <Icon name={subject.icon} size={28} />
                  {subject.title}
                </CardTitle>
                <CardDescription className="text-gray-700 text-base mt-2">
                  {subject.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className={`w-full bg-gradient-to-r ${subject.color} text-white font-bold py-3 rounded-xl shadow-lg hover:brightness-90 transition-all`}
                >
                  🎯 Пройти тест!
                </Button>
              </CardContent>
            </Card>
          ))}
        </main>

        <Dialog open={!!selectedSubject} onOpenChange={() => setSelectedSubject(null)}>
          <DialogContent className="max-w-2xl border-4 border-purple-400 bg-gradient-to-br from-yellow-50 to-pink-50">
            <DialogHeader>
              <DialogTitle className="text-3xl text-center text-purple-700" style={{ fontFamily: 'Comic Neue, Comic Sans MS, cursive' }}>
                {selectedSubject?.title}
              </DialogTitle>
              <DialogDescription className="text-center text-lg text-gray-700">
                Вопрос {currentQuizIndex + 1} из {selectedSubject?.quizzes.length} | 
                <span className="ml-2 font-bold text-green-600">Баллов: {score}</span>
              </DialogDescription>
            </DialogHeader>

            {currentQuiz && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-xl border-4 border-blue-300">
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">
                    {currentQuiz.question}
                  </h3>

                  <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showResult}>
                    <div className="space-y-3">
                      {currentQuiz.options.map((option, index) => (
                        <div 
                          key={index}
                          className={`flex items-center space-x-3 p-4 rounded-lg border-3 transition-all ${
                            showResult
                              ? index === currentQuiz.correct
                                ? 'bg-green-200 border-green-500'
                                : parseInt(selectedAnswer) === index
                                ? 'bg-red-200 border-red-500'
                                : 'bg-white border-gray-300'
                              : 'bg-white border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="text-lg cursor-pointer flex-1">
                            {option}
                          </Label>
                          {showResult && index === currentQuiz.correct && (
                            <span className="text-2xl">✅</span>
                          )}
                          {showResult && parseInt(selectedAnswer) === index && index !== currentQuiz.correct && (
                            <span className="text-2xl">❌</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex gap-4">
                  {!showResult ? (
                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={!selectedAnswer}
                      className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:scale-105 transition-all"
                    >
                      ✔️ Проверить ответ
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      className="flex-1 bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:scale-105 transition-all"
                    >
                      {currentQuizIndex < (selectedSubject?.quizzes.length ?? 0) - 1 
                        ? '➡️ Следующий вопрос' 
                        : `🎉 Завершить (${score}/${selectedSubject?.quizzes.length})`}
                    </Button>
                  )}
                </div>

                {showResult && (
                  <div className={`text-center text-2xl font-bold p-4 rounded-xl ${
                    parseInt(selectedAnswer) === currentQuiz.correct
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {parseInt(selectedAnswer) === currentQuiz.correct
                      ? '🎉 Правильно! Молодец!'
                      : '😔 Неправильно! Попробуй ещё раз в следующий раз!'}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <footer className="mt-16 text-center">
          <p className="text-white text-sm opacity-70 animate-blink" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            © 2026 Stype Educational Platform | Сделано с ❤️ для третьеклассников
          </p>
        </footer>
      </div>

      <div 
        className="fixed bottom-8 right-8 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-2xl cursor-pointer hover:rotate-12 hover:scale-110 transition-all duration-300 border-4 border-yellow-400"
        onClick={() => document.documentElement.requestFullscreen()}
      >
        <Icon name="Maximize" size={32} />
      </div>
    </div>
  );
}
