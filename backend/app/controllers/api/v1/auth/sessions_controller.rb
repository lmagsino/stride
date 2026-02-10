module Api
  module V1
    module Auth
      class SessionsController < Devise::SessionsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          render json: {
            user: user_json(resource),
            token: request.env["warden-jwt_auth.token"]
          }, status: :ok
        end

        def respond_to_on_destroy
          if current_user
            render json: { message: "Logged out successfully" }, status: :ok
          else
            render json: {
              error: { code: "unauthorized", message: "No active session" }
            }, status: :unauthorized
          end
        end

        def user_json(user)
          { id: user.id, email: user.email, name: user.name }
        end
      end
    end
  end
end
