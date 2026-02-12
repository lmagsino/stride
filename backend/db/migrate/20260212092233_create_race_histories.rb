class CreateRaceHistories < ActiveRecord::Migration[7.1]
  def change
    create_table :race_histories do |t|
      t.references :user, null: false, foreign_key: true
      t.string :race_name
      t.decimal :distance_km, null: false
      t.integer :finish_time_secs, null: false
      t.date :race_date, null: false
      t.text :notes

      t.timestamps
    end
  end
end
