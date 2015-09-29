class AddLinkToBlog < ActiveRecord::Migration
  def change
    add_column :blogs, :link, :text
  end
end
