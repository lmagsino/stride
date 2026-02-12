class CreateRunnerProfiles < ActiveRecord::Migration[7.1]
  def change
    create_table :runner_profiles do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.integer :experience_level, null: false, default: 0
      t.decimal :current_weekly_km, null: false, default: 0
      t.integer :available_days, null: false, default: 3
      t.integer :preferred_long_run_day, null: false, default: 6
      t.text :injury_notes

      t.timestamps
    end
  end
end
