Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth
      devise_for :users,
        path: "auth",
        path_names: { sign_in: "login", sign_out: "logout", registration: "signup" },
        controllers: {
          sessions: "api/v1/auth/sessions",
          registrations: "api/v1/auth/registrations"
        }

      namespace :auth do
        get "me", to: "current_user#show"
      end

      # Health check
      get "health", to: "health#show"
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
