class RaceHistory < ApplicationRecord
  belongs_to :user

  validates :distance_km, presence: true, numericality: { greater_than: 0 }
  validates :finish_time_secs, presence: true, numericality: { greater_than: 0 }
  validates :race_date, presence: true
end
