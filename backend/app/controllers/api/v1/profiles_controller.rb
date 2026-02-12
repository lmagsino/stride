module Api
  module V1
    class ProfilesController < ApplicationController
      before_action :authenticate_user!

      # GET /api/v1/profile
      def show
        profile = current_user.runner_profile
        races = current_user.race_histories.order(race_date: :desc)

        if profile
          render json: {
            profile: profile_json(profile),
            race_histories: races.map { |r| race_json(r) }
          }
        else
          render json: {
            profile: nil,
            race_histories: races.map { |r| race_json(r) }
          }
        end
      end

      # PUT /api/v1/profile
      def update
        profile = current_user.runner_profile || current_user.build_runner_profile

        if profile.update(profile_params)
          render json: { profile: profile_json(profile) }
        else
          render json: {
            error: {
              code: "validation_failed",
              message: "Profile update failed",
              details: profile.errors.full_messages
            }
          }, status: :unprocessable_entity
        end
      end

      private

      def profile_params
        params.require(:profile).permit(
          :experience_level, :current_weekly_km, :available_days,
          :preferred_long_run_day, :injury_notes
        )
      end

      DAY_NAMES = %w[sunday monday tuesday wednesday thursday friday saturday].freeze

      def profile_json(profile)
        {
          id: profile.id,
          experience_level: profile.experience_level,
          current_weekly_km: profile.current_weekly_km.to_f,
          available_days: profile.available_days,
          preferred_long_run_day: DAY_NAMES[profile.preferred_long_run_day],
          injury_notes: profile.injury_notes
        }
      end

      def race_json(race)
        {
          id: race.id,
          race_name: race.race_name,
          distance_km: race.distance_km.to_f,
          finish_time: format_time(race.finish_time_secs),
          finish_time_secs: race.finish_time_secs,
          race_date: race.race_date
        }
      end

      def format_time(total_secs)
        hours = total_secs / 3600
        mins = (total_secs % 3600) / 60
        secs = total_secs % 60
        if hours > 0
          format("%d:%02d:%02d", hours, mins, secs)
        else
          format("%d:%02d", mins, secs)
        end
      end
    end
  end
end
