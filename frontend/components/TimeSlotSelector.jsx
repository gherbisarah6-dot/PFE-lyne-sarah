'use client';

export default function TimeSlotSelector({ selectedTime, onSelectTime, timeSlots }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Time
      </label>

      <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
        {timeSlots.length > 0 ? (
          timeSlots.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => onSelectTime(time)}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                selectedTime === time
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              {time}
            </button>
          ))
        ) : (
          <div className="col-span-3 text-center py-4 text-gray-500 text-sm">
            No available time slots for this date
          </div>
        )}
      </div>

      {timeSlots.length > 0 && (
        <p className="text-xs text-gray-600">
          Select a preferred time slot for your appointment
        </p>
      )}
    </div>
  );
}
