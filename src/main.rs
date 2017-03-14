#[macro_use]
extern crate glium;
extern crate rand;

fn main() {
	use glium::{DisplayBuild, Surface};

	let display = glium::glutin::WindowBuilder::new()
		.with_dimensions(500, 500)
		.build_glium().unwrap();

	let data: Vec<u8> =
		(0..512*512*4)
		.map(|_| rand::random()).collect();

	let raw_img = glium::texture::RawImage2d::from_raw_rgba(data, (512, 512));

	use glium::texture::texture2d::Texture2d;
	println!("{}, {}", raw_img.width, raw_img.height);
	let noise_texture = Texture2d::new(&display, raw_img).unwrap();

	let mut program = load_shaders(&display);

	#[derive(Copy, Clone)]
	struct DatalessVertex{a:f32}
	implement_vertex!(DatalessVertex, a);
	
	let one_vertex_vbo: glium::VertexBuffer<DatalessVertex> = 
		glium::VertexBuffer::empty_immutable(&display, 1).unwrap();

	loop {
		for event in display.poll_events() {
			use glium::glutin::Event::*;
			use glium::glutin::VirtualKeyCode::Space;
			use glium::glutin::ElementState::Pressed;
			
			match event {
				Closed => return,
				KeyboardInput(Pressed, _, Some(Space)) =>
					program = load_shaders(&display),
				_ => {},
			}
		}

		let mut target = display.draw();
		target.clear_color(0.0, 0.0, 1.0, 1.0);
		target.draw(
			&one_vertex_vbo,
			&glium::index::NoIndices(glium::index::PrimitiveType::Points),
			&program,
			&uniform! { noise: &noise_texture },
			&Default::default()
		).unwrap();
		target.finish().unwrap();
	}
}

fn load_shaders(display: &glium::Display) -> glium::Program {
	glium::Program::from_source(
		display,
		&read_file("shaders/empty.vert"),
		&read_file("shaders/de.frag"),
		Some(&read_file("shaders/fullscreen.geom"))
	).unwrap()
}

fn read_file(path: &str) -> String {
	
	use std::fs::File;
	use std::io::Read;

	let mut f = File::open(path).unwrap();
	let mut s = String::new();
	f.read_to_string(&mut s).unwrap();
	
	s
}