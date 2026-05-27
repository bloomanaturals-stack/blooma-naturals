import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Sparkles, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import ProductCard from '@/components/ProductCard'

export default function Quiz() {
  const [quizType, setQuizType] = useState<'skincare' | 'haircare' | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  const { data: questions } = trpc.quiz.getQuestions.useQuery(
    { quizType: quizType! },
    { enabled: !!quizType }
  )

  const submitQuiz = trpc.quiz.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  })

  const handleSelect = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleNext = () => {
    if (questions && currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      submitQuiz.mutate({ quizType: quizType!, answers })
    }
  }

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1)
  }

  const handleRestart = () => {
    setQuizType(null)
    setCurrentQ(0)
    setAnswers({})
    setSubmitted(false)
  }

  const recommendations = submitQuiz.data?.recommendations

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#455848] section-padding py-16 text-center text-white">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6" />
          <span className="text-xs font-medium uppercase tracking-[0.2em]">AI Powered</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold mb-3">
          Discover Your Perfect Routine
        </h1>
        <p className="text-white/85 max-w-lg mx-auto text-sm md:text-base">
          Answer a few simple questions and our AI will recommend the best natural products for your unique skin and hair needs.
        </p>
      </div>

      <div className="section-padding py-12">
        <div className="max-w-2xl mx-auto">
          {!quizType ? (
            <div className="text-center space-y-8">
              <h2 className="text-xl font-semibold">What would you like help with?</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setQuizType('skincare')}
                  className="group bg-[#EBE5D9] rounded-xl p-8 hover:bg-[#EDF2EF] transition-colors text-center"
                >
                  <div className="w-16 h-16 bg-[#455848]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#455848]/30 transition-colors">
                    <Sparkles className="w-8 h-8 text-[#455848]" />
                  </div>
                  <h3 className="font-semibold mb-1">Skincare</h3>
                  <p className="text-xs text-[#2D2D2D]/60">Find products for glowing, healthy skin</p>
                </button>
                <button
                  onClick={() => setQuizType('haircare')}
                  className="group bg-[#EBE5D9] rounded-xl p-8 hover:bg-[#EDF2EF] transition-colors text-center"
                >
                  <div className="w-16 h-16 bg-[#2C3A30]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#2C3A30]/30 transition-colors">
                    <Sparkles className="w-8 h-8 text-[#2C3A30]" />
                  </div>
                  <h3 className="font-semibold mb-1">Haircare</h3>
                  <p className="text-xs text-[#2D2D2D]/60">Find products for strong, healthy hair</p>
                </button>
              </div>
            </div>
          ) : submitted && recommendations ? (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Your Personalized Recommendations</h2>
                <p className="text-sm text-[#2D2D2D]/60">Based on your quiz answers, we recommend these products</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {recommendations.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={handleRestart} className="btn-outline flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Retake Quiz
                </button>
                <button onClick={() => navigate('/shop')} className="btn-primary">
                  Browse All Products
                </button>
              </div>
            </div>
          ) : questions && questions[currentQ] ? (
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#455848] transition-all"
                    style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#2D2D2D]/50">{currentQ + 1}/{questions.length}</span>
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-semibold mb-6">{questions[currentQ].question}</h2>
                <div className="space-y-3">
                  {questions[currentQ].options.map((option: any) => (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(questions[currentQ].id, option.value)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        answers[questions[currentQ].id] === option.value
                          ? 'border-[#455848] bg-[#EDF2EF]'
                          : 'border-[#E5E5E5] hover:border-[#455848]/50'
                      }`}
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {currentQ > 0 && (
                  <button onClick={handleBack} className="btn-outline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!answers[questions[currentQ].id] || submitQuiz.isPending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitQuiz.isPending ? 'Analyzing...' : currentQ < questions.length - 1 ? (
                    <>Next <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Get Recommendations <Sparkles className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
