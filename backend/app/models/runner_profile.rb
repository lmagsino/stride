class RunnerProfile < ApplicationRecord
  belongs_to :user

  enum :experience_level, { beginner: 0, intermediate: 1, advanced: 2 }

  validates :experience_level, presence: true
  validates :current_weekly_km, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :available_days, presence: true, numericality: { in: 1..7 }
  validates :preferred_long_run_day, presence: true, numericality: { in: 0..6 }
end
