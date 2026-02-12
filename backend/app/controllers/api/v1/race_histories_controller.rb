module Api
  module V1
    class RaceHistoriesController < ApplicationController
      before_action :authenticate_user!

      # POST /api/v1/profile/race_histories
      def create
        race = current_user.race_histories.build(race_params)

        if race.save
          render json: { race_history: race_json(race) }, status: :created
        else
          render json: {
            error: {
              code: "validation_failed",
              message: "Could not save race history",
              details: race.errors.full_messages
            }
          }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/profile/race_histories/:id
      def destroy
        race = current_user.race_histories.find_by(id: params[:id])

        if race
          race.destroy
          render json: { message: "Race history deleted" }
        else
          render json: {
            error: { code: "not_found", message: "Race history not found" }
          }, status: :not_found
        end
      end

      private

      def race_params
        params.require(:race_history).permit(:race_name, :distance_km, :finish_time_secs, :race_date, :notes)
      end

      def race_json(race)
        {
          id: race.id,
          race_name: race.race_name,
          distance_km: race.distance_km.to_f,
          finish_time_secs: race.finish_time_secs,
          race_date: race.race_date,
          notes: race.notes
        }
      end
    end
  end
end
