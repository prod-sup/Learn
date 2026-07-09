import { useState } from 'react'
import { LESSONS, STEPS, STEP_TITLES } from '../content/positions'
import { POSITIONS, useStore, type PositionId } from '../store'
import { goToStep, standUp } from '../cinema/CameraDirector'
import { sfxChime, sfxClick, sfxChip } from '../audio'

const ACTION_LABEL = { fold: 'Fold', call: 'Call', raise: 'Raise' } as const

export function Lesson({ seated }: { seated: PositionId }) {
  const step = useStore((s) => s.step)!
  const hoverHand = useStore((s) => s.hoverHand)
  const complete = useStore((s) => s.complete)
  const completed = useStore((s) => s.completed.includes(seated))
  const lesson = LESSONS[seated]
  const id = STEPS[step]

  const [answer, setAnswer] = useState<'fold' | 'call' | 'raise' | null>(null)
  const [quizIdx, setQuizIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const next = () => {
    setAnswer(null); setPicked(null)
    if (step < STEPS.length - 1) goToStep(step + 1)
  }
  const prev = () => {
    setAnswer(null); setPicked(null); setQuizIdx(0); setDone(false)
    goToStep(step > 0 ? step - 1 : null)
  }

  const finishMission = () => {
    setDone(true)
    complete(seated)
    sfxChime(); sfxChip()
  }

  return (
    <div className="glass lesson" key={seated + id}>
      <div className="lesson-head">
        <span className="label">{seated === 'UTG1' ? 'UTG+1' : seated} · PASSO {step + 1}/{STEPS.length}</span>
        <h2>{STEP_TITLES[id]}</h2>
      </div>

      {id === 'flow' && (
        <p className="lesson-text">
          Observe o pulso dourado sobre o feltro: é a ordem da ação pré-flop.
          O marcador maior é <strong>você</strong>. Quem fala antes de você já revelou
          intenção; quem fala depois ainda é um mistério.
        </p>
      )}

      {id === 'why' && <p className="lesson-text">{lesson.why}</p>}

      {id === 'mindset' && (
        <ul className="lesson-list">
          {(POSITIONS.find((p) => p.id === seated)?.mindset ?? []).map((m) => <li key={m}>{m}</li>)}
        </ul>
      )}

      {id === 'objective' && (
        <ul className="lesson-list objective">
          {lesson.objective.map((o) => <li key={o}>{o}</li>)}
        </ul>
      )}

      {id === 'advantages' && (
        <div className="bars">
          {lesson.advantages.map((a) => (
            <div className="bar-row" key={a.label}>
              <span className="bar-label">{a.label}</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${a.value}%` }} /></div>
              <span className="bar-val">{a.value}</span>
            </div>
          ))}
        </div>
      )}

      {id === 'disadvantages' && (
        <ul className="lesson-list">
          {lesson.disadvantages.map((d) => <li key={d}>{d}</li>)}
        </ul>
      )}

      {id === 'range' && (
        <>
          <p className="lesson-text">{lesson.rangeNote} Passe o cursor sobre a matriz projetada no feltro.</p>
          <div className={`hand-chip ${hoverHand ? 'on' : ''}`}>
            {hoverHand ? (
              <>
                <strong>{hoverHand.label}</strong>
                <span className={hoverHand.inRange ? 'raise' : 'fold'}>
                  {hoverHand.inRange ? 'ABRIR (RAISE)' : 'FOLD'}
                </span>
              </>
            ) : <span className="dim">— toque uma mão —</span>}
          </div>
        </>
      )}

      {id === 'example' && (
        <>
          <p className="lesson-text">{lesson.example.question}</p>
          {!answer ? (
            <div className="plaque-actions">
              {(['fold', 'call', 'raise'] as const).map((a) => (
                <button key={a} className={`btn ${a === 'raise' ? 'gold' : ''}`} onClick={() => { setAnswer(a); sfxClick() }}>
                  {ACTION_LABEL[a]}
                </button>
              ))}
            </div>
          ) : (
            <div className={`verdict ${answer === lesson.example.correct ? 'good' : 'bad'}`}>
              <strong>{answer === lesson.example.correct ? 'Exato.' : `A jogada correta é ${ACTION_LABEL[lesson.example.correct]}.`}</strong>
              <p>{lesson.example.explain}</p>
            </div>
          )}
        </>
      )}

      {id === 'mission' && !done && (
        <>
          <p className="lesson-text dim">Pergunta {quizIdx + 1} de {lesson.quiz.length}</p>
          <p className="lesson-text"><strong>{lesson.quiz[quizIdx].q}</strong></p>
          <div className="quiz-opts">
            {lesson.quiz[quizIdx].options.map((o, i) => (
              <button
                key={o}
                className={`btn opt ${picked !== null ? (i === lesson.quiz[quizIdx].correct ? 'right' : i === picked ? 'wrong' : '') : ''}`}
                disabled={picked !== null}
                onClick={() => { setPicked(i); sfxClick() }}
              >{o}</button>
            ))}
          </div>
          {picked !== null && (
            <div className="plaque-actions">
              {quizIdx < lesson.quiz.length - 1 ? (
                <button className="btn gold" onClick={() => { setQuizIdx(quizIdx + 1); setPicked(null); sfxClick() }}>Próxima pergunta</button>
              ) : (
                <button className="btn gold" onClick={finishMission}>Receber a ficha dourada</button>
              )}
            </div>
          )}
        </>
      )}

      {id === 'mission' && done && (
        <div className="verdict good">
          <strong>Posição dominada.</strong>
          <p>Uma ficha dourada foi colocada na sua cadeira. Ela permanece ali para sempre.</p>
        </div>
      )}

      <div className="lesson-nav">
        <button className="btn" onClick={prev}>← Voltar</button>
        {id !== 'mission' && (
          <button className="btn gold" onClick={next} disabled={id === 'example' && !answer}>
            Continuar →
          </button>
        )}
        {id === 'mission' && (done || completed) && (
          <button className="btn gold" onClick={standUp}>Levantar da mesa</button>
        )}
      </div>
    </div>
  )
}
