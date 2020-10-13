const Gpio = require('onoff').Gpio;

class Stepper {
	constructor(M00, M01, M10, M11) {
		this.pins=[
			new Gpio(M00,'out'),
			new Gpio(M10,'out'),
			new Gpio(M01,'out'),
			new Gpio(M11,'out'),
		];

		this.direction=-1;
		this.value=0;
		this.setStepsPerSec(100);
	}

	setStepsPerSec(v) {
		this.intervalMillis=1000/v;
	}

	writePins(vals) {
		for (let i=0; i<4; i++)
			this.pins[i].writeSync(vals[i]);
	}

	updatePinsFromValue() {
		switch (this.value&3) {
			case 0:
				this.writePins([1,1,0,0]);
				break;

			case 1:
				this.writePins([0,1,1,0]);
				break;

			case 2:
				this.writePins([0,0,1,1]);
				break;

			case 3:
				this.writePins([1,0,0,1]);
				break;
		}
	}

	step(steps) {
		return new Promise((resolve, reject)=>{
			this.target=this.value+this.direction*steps;
			this.targetResolve=resolve;
			this.start();
		});
	}

	start() {
		this.stop();
		this.value+=this.direction;
		this.updatePinsFromValue();
		this.interval=setInterval(this.onInterval,this.intervalMillis);
	}

	onInterval=()=>{
		if (this.targetResolve && this.value==this.target) {
			let resolve=this.targetResolve;
			this.targetResolve=null;
			this.stop();
			resolve();
		}

		this.value+=this.direction;
		this.updatePinsFromValue();
	}

	setDirection(direction) {
		this.direction=direction?1:-1;
	}

	stop() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval=null;
		}
	}

	release() {
		this.writePins([0,0,0,0]);
	}
}

module.exports=Stepper;