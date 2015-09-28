require 'open-uri'
class BlogsController < ApplicationController
  before_filter :authenticate
  before_action :set_blog, only: [:show, :edit, :update, :destroy]

  # GET /blogs
  # GET /blogs.json
  def index
  @blogs = Blog.search(params[:search])
  end
  # GET /blogs/1
  # GET /blogs/1.json
  def show
  end

  # GET /blogs/new
  def new
    @blog = Blog.new
  end

  # GET /blogs/1/edit
  def edit
  render "cropper"
  end

  # POST /blogs
  # POST /blogs.json
  def create
    
    @blog = Blog.new(blog_params)
      if @blog.save
        render "cropper"
      else
        render :new 
      end
  end

  # PATCH/PUT /blogs/1
  # PATCH/PUT /blogs/1.json
  def update
    respond_to do |format|
      if @blog.update(blog_params)
        format.html { redirect_to @blog, notice: 'Image was successfully updated.' }
        format.json { render :show, status: :ok, location: @blog }
      else
        format.html { render :edit }
        format.json { render json: @blog.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /blogs/1
  # DELETE /blogs/1.json
  def destroy
    @blog.destroy
    respond_to do |format|
      format.html { redirect_to blogs_url, notice: 'Image crop was successfully destroyed.' }
      format.json { head :no_content }
    end
  end
  
   def guidelines
    # put any code here that you need 
    # (although for a static view you probably won't have any)
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_blog
      @blog = Blog.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def blog_params
      params.require(:blog).permit(:title, :description, :image, :link, :crop_x, :crop_y, :crop_w, :crop_h)
    end
end
