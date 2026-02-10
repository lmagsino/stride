module Api
  module V1
    module Auth
      class CurrentUserController < ApplicationController
        before_action :authenticate_user!

        def show
          render json: {
            user: {
              id: current_user.id,
              email: current_user.email,
              name: current_user.name,
              has_profile: current_user.respond_to?(:runner_profile) && current_user.runner_profile.present?,
              has_active_plan: false
            }
          }
        end
      end
    end
  end
end
