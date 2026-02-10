class ApplicationController < ActionController::API
  respond_to :json

  private

  def render_error(code:, message:, status:, details: nil)
    body = { error: { code: code, message: message } }
    body[:error][:details] = details if details
    render json: body, status: status
  end
end
