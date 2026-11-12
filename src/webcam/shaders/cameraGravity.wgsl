// ============================================================================
// cameraGravity.wgsl -- Motion gravity: every moving area pulls on everything.
//
// The other mappings are LOCAL: each texel of the field looks only at its own
// stencil, so a particle across the screen from a waved hand feels nothing.
// Gravity is the opposite. The amount of motion at each spot is treated as
// mass, and the pull at a point is the sum of every mass's pull on it --
// stronger when closer and when there is more motion.
//
// Two passes, both into small GRAVITY_DIM-square targets, run only while the
// mapping is Motion gravity (see `WebcamField.remap`):
//
//   mass_fs     blurred scalars (256^2) -> motion mass per coarse cell (32^2)
//   gravity_fs  mass grid               -> the pull at each coarse cell (32^2)
//
// cameraMap.wgsl then samples the 32^2 pull bilinearly into the full field.
// A long-range pull is smooth by nature, so computing it coarsely loses
// nothing worth keeping, and it turns a 65k x 1k sum into a 1k x 1k one.
//
// ----------------------------------------------------------------------------
// THE LAW
// ----------------------------------------------------------------------------
//   pull = sum over cells of  mass * area * dir * (REFERENCE_DISTANCE / r)^falloff
// with r softened (SOFTENING) so a particle sitting on the motion is not flung.
// Writing the falloff relative to a reference distance keeps a Falloff change
// from also rescaling the overall strength: at REFERENCE_DISTANCE the pull is
// the same whatever the exponent, and only how it changes with distance moves.
// Falloff 0 pulls equally from anywhere; 1 is 2D gravity; 2 is 3D gravity.
//
// Like the other camera passes, positions come from in.clip.xy and rows run
// v-up, so a difference along +row is world +y with no sign fix.
// ============================================================================

#include "fullscreenQuad.wgsl"

struct GravityUniforms {
    // x: aspect   world width / world height
    // y: falloff  exponent, see THE LAW above
    // z, w: unused
    params : vec4f,
}

@group(0) @binding(0) var<uniform> u : GravityUniforms;
@group(0) @binding(1) var src : texture_2d<f32>;
@group(0) @binding(2) var src_sampler : sampler;
@group(0) @binding(3) var mass : texture_2d<f32>;

// Must match `GRAVITY_DIM` in webcamField.ts, which sizes the targets.
const GRAVITY_DIM : i32 = 32;
// Where Falloff stops mattering to strength: a quarter of the world's height.
const REFERENCE_DISTANCE : f32 = 0.25;
// Softens r near the motion itself, in world-height units (~1.5 cells).
const SOFTENING : f32 = 0.05;
// TUNED BY EYE, like the other camera gains: a hand-sized patch of motion
// (0.3 over a tenth of the world each way) pulls at about 0.5 from a quarter
// of the screen away, before the soft ceiling in cameraMap.wgsl.
const GRAVITY_GAIN : f32 = 150.0;
// Cells quieter than this are skipped: they pull next to nothing anyway.
const MASS_FLOOR : f32 = 1e-4;

// The motion channel averaged over this cell's block of the blurred field.
// Each bilinear tap lands on a texel corner and so averages a 2x2 group; 4x4
// such taps cover an 8x8 block exactly, so no motion falls between samples.
@fragment
fn mass_fs(in : FsQuadVsOut) -> @location(0) vec4f {
    let cell = floor(in.clip.xy);
    let src_dim = vec2f(textureDimensions(src));
    let block = src_dim / f32(GRAVITY_DIM);
    let origin = cell * block;
    let step = block / 4.0;
    var sum = 0.0;
    for (var j = 0; j < 4; j++) {
        for (var i = 0; i < 4; i++) {
            let texel = origin + (vec2f(f32(i), f32(j)) + 0.5) * step;
            sum += textureSampleLevel(src, src_sampler, texel / src_dim, 0.0).g;
        }
    }
    return vec4f(sum / 16.0, 0.0, 0.0, 1.0);
}

// The summed pull of every cell's mass on this one, in world axes.
@fragment
fn gravity_fs(in : FsQuadVsOut) -> @location(0) vec4f {
    let aspect = u.params.x;
    let falloff = u.params.y;
    let here = floor(in.clip.xy);
    // One cell's size in world units: the world is `aspect` wide, 1 tall.
    let cell = vec2f(aspect, 1.0) / f32(GRAVITY_DIM);
    let area = cell.x * cell.y;
    let s2 = SOFTENING * SOFTENING;
    var pull = vec2f(0.0);
    for (var j = 0; j < GRAVITY_DIM; j++) {
        for (var i = 0; i < GRAVITY_DIM; i++) {
            let m = textureLoad(mass, vec2i(i, j), 0).r;
            if (m < MASS_FLOOR) { continue; }
            let d = (vec2f(f32(i), f32(j)) - here) * cell;
            let r = sqrt(dot(d, d) + s2);
            pull += (m * area) * (d / r) * pow(REFERENCE_DISTANCE / r, falloff);
        }
    }
    var v = pull * GRAVITY_GAIN;
    // Never hand on a non-finite value; see cameraMap.wgsl.
    if (any(v != v) || any(abs(v) > vec2f(1e4))) { v = vec2f(0.0); }
    return vec4f(v, 0.0, 1.0);
}
