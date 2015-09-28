require 'open-uri' 
class Blog < ActiveRecord::Base
  attr_accessor :crop_x, :crop_y, :crop_w, :crop_h
  
	def self.search(search)
	  if search
		self.where("title || description like ?", "%#{search}%")
	  else
		self.all
	  end
	end
   
  def cropping?
    !crop_x.blank? && !crop_y.blank? && !crop_w.blank? && !crop_h.blank?
  end 
  def slug
    description.downcase.gsub(" ", "-")  
  end	
  def to_param
  	"#{id}-#{slug}"
  end	

end
