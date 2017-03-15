#version 140

uniform sampler2D noise;

out vec4 color;

float rand(int iters){
	ivec2 p = ivec2(mod(gl_FragCoord.xy+vec2(iters, 0), vec2(512, 512)));
    vec4 sample = texelFetch(noise, p, 0);
    return sample.x + sample.y / 256;
}

void sphere_fold(inout vec3 x, vec3 center, float radius) {
	vec3 dx = x - center;
	x = center + (radius * radius / length(dx)) * normalize(dx);
}

//http://archive.bridgesmathart.org/2016/bridges2016-367.pdf

vec3 spheres[6];

bool try_all_spheres(inout vec3 x) {
	for (int i = 0; i < 6; i++) {
		vec3 s = spheres[i];
		if (length(s - x) < 1) {
			sphere_fold(x, s, 1);
			return true;
		}
	}
	return false;
}

bool fractal(vec3 x) {
	for (int i = 0; i < 7; i++) {
		if(!try_all_spheres(x)){
			return false;
		}
	}

	return true;
}

vec2 viewport;

vec3 calc_ray(vec2 pixel) {
	vec2 pos = pixel / viewport * 2 - vec2(1, 1);
	return normalize(vec3(pos, 1));
}

void main() {
	spheres[0] = vec3(-sqrt(2), 0, 0);
	spheres[1] = vec3(sqrt(2), 0, 0);
	spheres[2] = vec3(0, -sqrt(2), 0);
	spheres[3] = vec3(0, sqrt(2), 0);
	spheres[4] = vec3(0, 0, -sqrt(2));
	spheres[5] = vec3(0, 0, sqrt(2));

	viewport = vec2(500, 500);
	vec3 ray = calc_ray(gl_FragCoord.xy);

	vec3 start = vec3(-0.05, -0.5, -1);
	float maxdist = 2;

	for (int i = 0; i < 1000; i++) {
		float dist = maxdist * rand(i);
		vec3 sample_pos = start + dist*ray;
		if (fractal(sample_pos)) {
			maxdist = dist;
		}
	}

	float pixel_size = maxdist * abs(ray.x - calc_ray(gl_FragCoord.xy+vec2(1, 1)).x);
	vec3 normal = normalize(cross(
		vec3(pixel_size, 0, dFdx(maxdist)),
		vec3(0, pixel_size, dFdy(maxdist))
	));
	vec3 lightdir = normalize(vec3(1, 0, 0.5));

	color = vec4(dot(normal, lightdir), 0, 0, 1);
}