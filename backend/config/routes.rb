Rails.application.routes.draw do
  # Devise auth routes — kept outside namespace to use :user scope,
  # but path is set to /api/v1/auth for correct URL structure.
  devise_for :users,
    path: "api/v1/auth",
    path_names: { sign_in: "login", sign_out: "logout", registration: "signup" },
    controllers: {
      sessions: "api/v1/auth/sessions",
      registrations: "api/v1/auth/registrations"
    }

  namespace :api do
    namespace :v1 do
      namespace :auth do
        get "me", to: "current_user#show"
      end

      # Health check
      get "health", to: "health#show"
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
