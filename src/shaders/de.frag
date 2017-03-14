#version 140

uniform sampler2D noise;

out vec4 color;

float rand(int iters){
	ivec2 p = ivec2(mod(gl_FragCoord.xy+vec2(iters, 0), vec2(512, 512)));
    vec4 sample = texelFetch(noise, p, 0);
    return sample.x + sample.y / 256;
}

bool sphere(vec3 x) {
	return length(x) < 1;
}

vec2 viewport;

vec3 calc_ray(vec2 pixel) {
	vec2 pos = pixel / viewport * 2 - vec2(1, 1);
	return normalize(vec3(pos, 1));
}

void main() {
	viewport = vec2(500, 500);
	vec3 ray = calc_ray(gl_FragCoord.xy);

	vec3 start = vec3(0, 0, -4);
	float maxdist = 20;

	for (int i = 0; i < 1000; i++) {
		float dist = maxdist * rand(i);
		vec3 sample_pos = start + dist*ray;
		if (sphere(sample_pos)) {
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