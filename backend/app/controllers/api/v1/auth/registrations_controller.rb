module Api
  module V1
    module Auth
      class RegistrationsController < Devise::RegistrationsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          if resource.persisted?
            render json: {
              user: user_json(resource),
              token: request.env["warden-jwt_auth.token"]
            }, status: :created
          else
            render json: {
              error: {
                code: "validation_failed",
                message: "Signup failed",
                details: resource.errors.full_messages
              }
            }, status: :unprocessable_entity
          end
        end

        def sign_up_params
          params.require(:user).permit(:email, :password, :password_confirmation, :name)
        end

        def user_json(user)
          { id: user.id, email: user.email, name: user.name }
        end
      end
    end
  end
end
