map '/closure' do
  run Rack::Directory.new('../closure')
end

map '/pl' do
  run Rack::Directory.new(Dir.pwd)
end

map '/' do
  run Rack::Directory.new(Dir.pwd)
end