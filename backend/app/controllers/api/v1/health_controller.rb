module Api
  module V1
    class HealthController < ApplicationController
      def show
        render json: { status: "ok", app: "stride", version: "1.0.0" }
      end
    end
  end
end
