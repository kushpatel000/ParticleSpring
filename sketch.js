function setup() {

	nrows = 6;
	ncols = 10;
	scale = 50;
	k = 1;
	dt= 0.05;
	
	createCanvas( scale*(1+ncols) , scale*(1+nrows));

	net = new Network(ncols,nrows,scale,k,dt);
	net.nudge(0.1);

}

function draw() {
	rect(0,0,width,height);
	var ctx = canvas.getContext("2d");
	net.draw(ctx);
}

// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean=0, stdev=1) {
    let u = 1 - Math.random(); // Converting [0,1) to (0,1]
    let v = Math.random();
    let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

class Network {
	constructor(ncols,nrows,scale,k,dt) {
		this.particles = [];
		this.velocity = [];
		this.bonds = [];
		this.scale = scale;
		this.k = k;
		this.dt = dt;

		for (let r = 0; r < nrows; r++){
			for (let c = 0; c < ncols; c++){
				let i = r * ncols + c;
				this.particles.push( createVector(scale*(c+1),scale*(r+1)) );
				this.velocity.push( createVector(0.0,0.0) );
				if (c > 0) {
					this.bonds.push([i,i-1]);
				}
				if (r > 0) {
					this.bonds.push([i,i-ncols]);
				}
			}
		}
	}

	nudge(sig) {
		for (let i=0; i<this.particles.length; i++){
			this.particles[i].add(
				randomGaussian(0.0,this.scale*sig), 
				randomGaussian(0.0,this.scale*sig)
			)
		} 

	}
	
	update() {
		// calculate acceleration
		var acc = [];
		for (let i=0; i<this.particles.length; i++){
			acc.push(createVector(0,0));
		}
		var potential_energy = 0.0;
		for (let i=0; i<this.bonds.length; i++){
			var ia = this.bonds[i][0];
			var ib = this.bonds[i][1];

			var pa = this.particles[ ia ];
			var pb = this.particles[ ib ];
			
			var r_vec = p5.Vector.sub(pb,pa);
			var r_mag = r_vec.mag();
			var del_x = r_mag - this.scale;
			potential_energy += this.k*del_x*del_x

			var f_vec = p5.Vector.mult( r_vec, this.k*del_x/r_mag );
			if (r_mag > 0) {
				acc[ia].add( f_vec );
				acc[ib].sub( f_vec );
			}
			
			// console.log( 'r_mag' , r_mag );
			// console.log( 'del_x' , del_x );
			// console.log( 'f_vec' , f_vec );
			
		}

		var kinetic_energy = 0.0;
		for (let i=0; i<this.particles.length; i++){
			this.velocity[i].add( acc[i].mult(this.dt) );
			this.particles[i].add( this.velocity[i].mult(this.dt) );

			kinetic_energy += this.velocity[i].magSq()

		}
		// console.log( 'vel' , this.velocity[0] );
		// console.log( 'acc[0]' , acc[0] );
		console.log('Energy: ', kinetic_energy + potential_energy)
			
	}

	draw(ctx) {
		// move particles
		this.update()

		// draw bonds
		
		for (let i=0; i<this.bonds.length; i++){
			let b = this.bonds[i];
			let pa = this.particles[ b[0] ];
			let pb = this.particles[ b[1] ];
			ctx.beginPath();
			ctx.moveTo( pa.x, pa.y );
			ctx.lineTo( pb.x, pb.y );
			ctx.stroke(); 
			
		}

		// draw particles
		for (let i=0; i<this.particles.length; i++){
			let p = this.particles[i];
			ellipse( p.x, p.y, scale/2, scale/2)
		}
	}
}