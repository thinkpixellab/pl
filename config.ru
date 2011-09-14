require 'rubygems'
require 'bundler'
Bundler.setup

require 'rack-rewrite'
require 'rack/contrib'

use Rack::ETag
use Rack::ResponseHeaders do |headers|
  headers['Cache-Control'] = 'public'
end
use Rack::Rewrite do
  rewrite '/', '/index.html'
end
run Rack::Directory.new(Dir.pwd)
