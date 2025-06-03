import React from 'react'

const CoachSelector = ({coaches, currentCoach, onSelectCoach}) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        {coaches.map((coach, index) => (
            <div
            key={coach.id}
            onClick={() => onSelectCoach(coach.id)}
            className="flex flex-col items-center cursor-pointer rounded-lg p-2 transition-all"
            style={{
                backgroundColor: currentCoach === index ? '#0080c3' : '#f3f4f',
                color: currentCoach === index ? 'white' : 'black',
            }}
            >
                <div className="text-sm font-medium">Coach {coach.id}</div>
                <div className="text-xs">{coach.name}</div>
            </div>
        ))}
    </div>
  )
}

export default CoachSelector