class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  has_one :runner_profile, dependent: :destroy
  has_many :race_histories, dependent: :destroy

  validates :name, presence: true
end
