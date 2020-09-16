/*
	Path Generator
	Agra Barecasco

	this interactive-canvas will draw a path based on two user inputs:
	a chained path linkages or a set of move commands
*/

function App (charm) {
	var self            = this;

	var app 		= {}; // the global container
	gapp 			= app;
	var cm 			= charm;
	var ut 			= cm.utils;
	var cf 			= cm.config;
	var cs 			= cm.constants;
	var draggeds	= 0;
	var language	= "en";
	var canvas;
	var cx;
	var propagator;
	var is_flag 		= false;
	var scenes 			= [];
	var currentScene 	= -1;
	var animator 		= undefined;
	var sceneIterator 	= 0;
	var cv_half_height 	= cf.canvasHeight/2;
	var cv_half_width 	= cf.canvasWidth/2;
	

	// --------------------------------------------------------------- SCENES
	function scene0() {
		currentScene = 0;
		console.log("============================= SCENE", sceneIterator);
		//create_background();
		create_inputbox();
		create_arrow_slots();
		create_run_button();
		create_next_button();
		create_arrow_inputs();
		create_check_flag();
		create_texts();
		create_snapdot_generator();
		create_pencil();
		sceneIterator++;
	}

	function scene1() {
		currentScene = 1;
		console.log("============================= SCENE", sceneIterator);
		create_quiz_generator();
		app.create_snapdots_field(cf.canvasWidth/2 + 100, 140, 5, 5, 60);
		app.create_quizdot_field(cf.canvasWidth/2-240 - 100, 140, 5, 5, 60);
		sceneIterator++;
		setTimeout(scenes[sceneIterator], 1000);
	}
	
	function scene2() {
		current_scene = 2;
		console.log("============================= SCENE", sceneIterator);
		app.start_quiz();
		sceneIterator++;
	}

	// --------------------------------------------------------------- FUNCTIONS
	function create_texts() {
		
		var tit_text_specs = {
			x : cf.canvasWidth/2, // the number is obtained from q.centerize()
			y : 50,
			fonts : ["30pt Times New Roman"],
			colors : ['#000000'],
			lines : [0],
			linesWidth : 30,
			textAlign : "center",
			fills : ["Test 1"]	
		}

		var exp_text_specs = {
			x       	: 83, // the number is obtained from q.centerize()
			y       	: cf.canvasHeight - 135,
			fonts		: ["16pt Times New Roman"],
			colors		: ['#000000'],
			lines		: [0, 1, 2, 3],
			linesWidth 	: 30,
			textAlign : "left",
			fills		: [
			"Gunakan tombol di samping untuk",
			"menyusun goresan pensil hingga sesuai",
			"dengan contoh bangun di sebelah kiri."]	
		}

		var tit_text = cm.createNativeText(tit_text_specs);	
		var exp_text = cm.createNativeText(exp_text_specs);	

		app.set_title_text = function(new_text) {
			animator.fadeOut(tit_text.transform, 0.5, function(){
				tit_text.setFills([new_text]);
				animator.fadeIn(tit_text.transform, 0.5);
			});

		};
		
	}

	function create_background() {
		var img = cm.createImage ({
            path            : "Bg.png",
            x       		: 0.0,
			y       		: 0.0,
			anchorX			: 0,
			anchorY			: 0,
			layerIndex		: 0,
			name  			: 'background'			
		});

		app.get_bg_index = function() {
			return propagator.getSubscribeIndex(img.image);
		}
	}
	
	function create_inputbox() {
		var img = cm.createImage ({
            path            : "images/inputbox.png",
            x       		: cf.canvasWidth/2,
			y       		: cf.canvasHeight - 310,
			anchorX			: 430.5,
			anchorY			: 0,
			layerIndex		: 0
		});

		app.get_bg_index = function() {
			return propagator.getSubscribeIndex(img.image);
		}
	}
	
	function create_pencil() {
		var img = cm.createImage ({
            path            : "images/pencil.png",
            x       		: cf.canvasWidth + 100,
			y       		: 100,
			anchorX			: 0,
			anchorY			: 96,
			rotation		: 0,
			layerIndex		: 0,
			scaleX : 0.8,
			scaleY : 0.8
		});
		
		img.image.disable();
		
		app.show_pencil = function () {
			img.transform.alpha = 0;
			img.image.enable();
			animator.fadeIn(img.transform, 0.3);
			propagator.riseSubscriber(img.image);
		};
		
		app.hide_pencil = function () {
			animator.fadeIn(img.transform, 0.3, function(){
				img.image.disable();
			});
		};
				
		app.rise_pencil = function () {
			propagator.riseSubscriber(img.image);
		};
					
		app.set_pencil_pos = function (x, y, is_instant) {
			if (is_instant) {
				img.transform.x = x;
				img.transform.y = y;
			}
			else {
				animator.easeMoveTo (img.transform, x, y, 0.5);
			}
		};
		
		
	}
	
	function create_snapdot_generator() {
		/*
		A dot represent snapping point for any dropped object within
		a defined proximity.
		*/
		var snapdots = [];
		var quizdots = [];
		let snapping_radius = 30;
		var pen_index = 0;
		var initial_pen_index = 0;
		var quiz_pen_index = 0;
		var snapdot_nrow = 0;
		var snapdot_ncol = 0;
		var quiz_nrow = 0;
		var quiz_ncol = 0;
		var quiz_stroke;
		var pencil_stroke;

		function create_dot(x, y) {
			var tf 	= cm.createTransform();
			tf.x 	= x;
			tf.y 	= y;
			var shape = cm.createShape (tf, {
				kind : 'circle',
				radius: 6,
				color: 'white',
				outline:true,
				layerIndex:0
			});
			shape.enable();
			var dot = {
				transform: tf,
				shape: shape
			};
			return dot;
		};
	
		app.create_snapdots_field = function (start_x, start_y, nrow, ncol, spacing) {			
			snapdot_nrow = nrow;
			snapdot_ncol = ncol;
						
			for (var i = 0; i < nrow; i++) {
				for (var j = 0; j < ncol; j++){
					snapdots.push(create_dot(start_x + spacing * j, start_y + spacing * i));
				}
			}
			
			app.get_snapdot_rowcol = function(index) {
				let row  = Math.floor(index/snapdot_ncol) + 1;
				let col  = index - (row - 1) * snapdot_ncol + 1;	
				
				return {
					row: row,
					col: col
				};
			};
			
			app.get_snapdot_index = function(row, col) {
				let index = snapdot_ncol * (row-1) + col - 1;
				return index;
			};
			
			app.reset_snapdot_pen_pos = function() {
				let dot = snapdots[initial_pen_index];
				app.set_pencil_pos(dot.transform.x, dot.transform.y);
				pen_index = initial_pen_index;
			};

			app.set_snapdot_pen_index = function(index) {
				if (index < 0 || index > 25) return;
				initial_pen_index = index;
				pen_index = index;
				let dot = snapdots[pen_index];
				app.show_pencil();
				app.set_pencil_pos(dot.transform.x, dot.transform.y);
				
			};
			
			// app.set_snapdot_pen_index = function(row, col) {
				// if (row > snapdot_nrow) return;
				// if (col > snapdot_ncol) return;
				// pen_index = snapdot_ncol * (row - 1) + col - 1;
			// };
		};
		
		app.create_quizdot_field = function (start_x, start_y, nrow, ncol, spacing) {
			// continue here
			quizdot_nrow = nrow;
			quizdot_ncol = ncol;
			
						
			for (var i = 0; i < nrow; i++) {
				for (var j = 0; j < ncol; j++){
					quizdots.push(create_dot(start_x + spacing * j, start_y + spacing * i));
				}
			}
			
			app.get_quizdot_rowcol = function(index) {
				let row  = Math.floor(index/quizdot_ncol) + 1;
				let col  = index - (row - 1) * quizdot_ncol + 1;	
				
				return {
					row: row,
					col: col
				};
			};
			
			app.get_quizdot_index = function(row, col) {
				let index = quizdot_ncol * (row-1) + col - 1;
				return index;
			};

			app.set_quizdot_pen_index = function(index) {
				if (index < 0 || index > 25) return;
				quiz_pen_index = index;
			};

			// app.set_quizdot_pen_index = function(row, col) {
				// if (row > quizdot_nrow) return;
				// if (col > quizdot_ncol) return;
				// quiz_pen_index = quizdot_ncol * (row - 1) + col - 1;
			// };
		};
		
		app.destroy_snapdot_path = function() {
			if (pencil_stroke) {
				animator.fadeOut(pencil_stroke.transform, 0.3, function() {
					pencil_stroke.destroy();
					pencil_stroke = undefined;
				});
			}
		};
				
		app.create_snapdot_path = function (directions, cback) {
			if (pencil_stroke) {
				pencil_stroke.destroy();
				pencil_stroke = undefined;
			}
			var callback;
			if (cback) callback = cback;
			var draw_time = directions.length * 0.4;	
			let verticesX = [];
			let verticesY = [];
			let index_array = [pen_index];
			console.log('current pen index', pen_index);
			let rowcol 	  = app.get_snapdot_rowcol(pen_index);
			let curr_row  = rowcol.row;
			let curr_col  = rowcol.col;
		
			directions.forEach(function(direction_index) {

				switch(direction_index) {
					case 0:
						curr_col += 1;
						break;
					case 1:
						curr_col += 1;
						curr_row += 1;
						break;	
					case 2:
						curr_row += 1;
						break;
					case 3:
						curr_col -= 1;
						curr_row += 1;
						break;							
					case 4:
						curr_col -= 1;
						break;
					case 5:
						curr_col -= 1;
						curr_row -= 1;
						break;	
					case 6:
						curr_row -= 1;
						break;
					case 7:
						curr_col += 1;
						curr_row -= 1;
						break;	
				}
				
				if (curr_row < 1 || curr_row > snapdot_nrow) return;
				if (curr_col < 1 || curr_col > snapdot_ncol) return;
				
				pen_index = app.get_snapdot_index(curr_row, curr_col);
				//console.log(curr_row, curr_col, pen_index);
				index_array.push(pen_index);
			});

			
			for (var i = 0; i<index_array.length; i++) {
				let dot = snapdots[index_array[i]];
				verticesX.push(dot.transform.x);
				verticesY.push(dot.transform.y);
			}
			
			let trace_length = verticesX.length - 1;
			let tracerX  = [verticesX[0]];
			let tracerY  = [verticesY[0]];
			
			var stroke 		= cm.createPath({
				x 			: 0,
				y 			: 0,
				verticesX 	: tracerX,
				verticesY 	: tracerY,
				color 		: "#000000",
				thickness 	: 7
			});
			pencil_stroke = stroke;
			
			drawline(draw_time);
			
			
			function drawline(draw_time) {
				let pod = {};
				let time = 0;
				pod.update = function(context, frameStep, sceneNumber) {
					time += frameStep;

					if (time < draw_time) {
						let trace_reach = time/draw_time * (trace_length);
						let trace_index = Math.floor(trace_reach);
						let pen_reach 	= trace_reach - trace_index;
						tracerX = verticesX.slice(0, trace_index+1);
						tracerY = verticesY.slice(0, trace_index+1);
						
						penX = verticesX[trace_index] + pen_reach * (verticesX[trace_index+1] - verticesX[trace_index]);
						penY = verticesY[trace_index] + pen_reach * (verticesY[trace_index+1] - verticesY[trace_index]);
						

						tracerX.push(penX);
						tracerY.push(penY);
						app.set_pencil_pos (penX, penY, true);
						stroke.path.updateVertices(tracerX, tracerY);
					}
					else {
						propagator.removeSubscriber(pod);
						if(callback) callback();
					}
				};
				propagator.addSubscriber(pod);
				app.rise_pencil();
			};
		};	
		
		app.create_quizdot_path = function (directions, draw_time, cback) {
			if (quiz_stroke) {
				quiz_stroke.destroy();
			}
			
			var callback;
			if (cback) callback = cback;

			let verticesX = [];
			let verticesY = [];
			let index_array = [quiz_pen_index];
			console.log('current quiz pen index', quiz_pen_index);
			let rowcol 	  = app.get_quizdot_rowcol(quiz_pen_index);
			let curr_row  = rowcol.row;
			let curr_col  = rowcol.col;
		
			directions.forEach(function(direction_index) {

				switch(direction_index) {
					case 0:
						curr_col += 1;
						break;
					case 1:
						curr_col += 1;
						curr_row += 1;
						break;	
					case 2:
						curr_row += 1;
						break;
					case 3:
						curr_col -= 1;
						curr_row += 1;
						break;							
					case 4:
						curr_col -= 1;
						break;
					case 5:
						curr_col -= 1;
						curr_row -= 1;
						break;	
					case 6:
						curr_row -= 1;
						break;
					case 7:
						curr_col += 1;
						curr_row -= 1;
						break;	
				}
				
				if (curr_row < 0 || curr_row > snapdot_nrow) return;
				if (curr_col < 0 || curr_col > snapdot_ncol) return;

				quiz_pen_index = app.get_quizdot_index(curr_row, curr_col);
				//console.log(curr_row, curr_col, pen_index);
				index_array.push(quiz_pen_index);
			});

			
			for (var i = 0; i<index_array.length; i++) {
				let dot = quizdots[index_array[i]];
				verticesX.push(dot.transform.x);
				verticesY.push(dot.transform.y);
			}
			
			let trace_length = verticesX.length - 1;
			let tracerX  = [verticesX[0]];
			let tracerY  = [verticesY[0]];
			
			var stroke 		= cm.createPath({
				x 			: 0,
				y 			: 0,
				verticesX 	: tracerX,
				verticesY 	: tracerY,
				color 		: "#bb2222",
				thickness 	: 7
			});
			quiz_stroke = stroke;
			
			drawline(draw_time);
					
			
			function drawline(draw_time) {
				let pod = {};
				let time = 0;
				pod.update = function(context, frameStep, sceneNumber) {
					time += frameStep;

					if (time < draw_time+frameStep) {
						let trace_reach = time/draw_time * (trace_length);
						let trace_index = Math.floor(trace_reach);
						let pen_reach 	= trace_reach - trace_index;
						tracerX = verticesX.slice(0, trace_index+1);
						tracerY = verticesY.slice(0, trace_index+1);
						
						penX = verticesX[trace_index] + pen_reach * (verticesX[trace_index+1] - verticesX[trace_index]);
						penY = verticesY[trace_index] + pen_reach * (verticesY[trace_index+1] - verticesY[trace_index]);
						

						tracerX.push(penX);
						tracerY.push(penY);
						stroke.path.updateVertices(tracerX, tracerY);
					}
					else {
						propagator.removeSubscriber(pod);
						if (callback) callback();
					}
				};
				propagator.addSubscriber(pod);
			};
		};	
		

	}
	
	function create_quiz_generator () {
		/*
			(-1)
			1	2	3	4	5
			6	7	8	9	10
			11	12	13	14	15 
			16	17	18	19	20
			21	22	23	24	25
		*/
		var tests = [];
		var current_level = 0;
		var current_test;
		var level_names = ['smallsquare', 'bigsquare', 'crystal', 'house', 'ball'];
		
		tests.push ({
			name: 'smallsquare',
			start_index : 7,
			wind_directions : ['se', 'sw', 'nw', 'ne'],
			answers : ['se', 'sw', 'nw', 'ne']
		});
		
		tests.push ({
			name: 'bigsquare',
			start_index : 6,
			wind_directions : ['e', 'e', 's', 's', 'w', 'w', 'n', 'n'],
			answers : ['e', 'e', 's', 's', 'w', 'w', 'n', 'n']
		});
		
		tests.push ({
			name: 'crystal',
			start_index : 2,
			wind_directions : ['se', 's', 's', 'sw', 'nw', 'n', 'n', 'ne'],
			answers : ['se', 's', 's', 'sw', 'nw', 'n', 'n', 'ne']
		});
		
		tests.push ({
			name: 'house',
			start_index : 7,
			wind_directions : ['se', 's', 'w', 'w', 'n', 'ne'],
			answers : ['se', 's', 'w', 'w', 'n', 'ne']
		});
		
		tests.push ({
			name: 'ball',
			start_index : 1,
			wind_directions : ['e', 'e', 'se', 's', 's', 'sw', 'w', 'w', 'nw', 'n', 'n', 'ne'],
			answers : ['e', 'e', 'se', 's', 's', 'sw', 'w', 'w', 'nw', 'n', 'n', 'ne']
		});
		
		app.check_answer = function (directions) {
			// check directions
			let answer = get_indexed_directions(current_test.answers);
			let rev_answer = get_rev_indexed_directions(current_test.answers);
			
			if ( JSON.stringify(directions)==JSON.stringify(answer) ||
				JSON.stringify(directions)==JSON.stringify(rev_answer) 
			) {
				return true;
			}
			else {
				return false;
			}
		};
		
		app.go_to_next_level = function () {
			if (current_level == 4) {
				current_level = 0;
			}
			else {
				current_level++;
			}
			
			let level_name = level_names[current_level];
			generate_quiz(level_names[current_level]);
			app.set_title_text("Test " + (current_level+1));
		};
		
		app.start_quiz = function () {
			generate_quiz(level_names[current_level]);
		}
		
		function generate_quiz (name) {
			
			for (var i = 0; i < tests.length; i++) {
				let test = tests[i];
				
				if (name == test.name) {
					console.log("name match");
					app.set_quizdot_pen_index(test.start_index);
					let dirs = get_indexed_directions(test.wind_directions);
					app.create_quizdot_path (dirs, 1, function(){
						app.set_snapdot_pen_index(test.start_index);
					});
					current_test = test;
					break;
				}
			}
			
		};
	}
	
	function create_arrow_slots() {
		var spacing = 70;
		var amount = 12;
		var slots = [];
		var arrows = [];
		var directions = [];
		var current_slot_index = 0;
		var ypos = cf.canvasHeight - 265;
		var startx = 100;
		
		for (var i = 0; i < amount; i++) {
			let xpos = startx + i * spacing;
			// let img_slot = cm.createImage({
				// path            : "arrowfill.png",
				// x       		: xpos,
				// y       		: ypos,
				// scaleX : 0.45,
				// scaleY : 0.45,
				// anchorX : 71,
				// anchorY : 71,
				// layerIndex : 0
			// });
			// slots.push(img_slot);
			
			let img_arrow = cm.createImage({
				path            : "images/input.png",
				x       		: xpos,
				y       		: ypos,
				scaleX : 0.5,
				scaleY : 0.5,
				anchorX : 60.5,
				anchorY : 60.5
			});
			img_arrow.image.disable();
			
			arrows.push(img_arrow);
		}
		
		app.backspace_arrow_slot = function() {
			current_slot_index--;
			if (current_slot_index < 0) {
				current_slot_index = 0;
				return;
			}
			let arrow = arrows[current_slot_index];
			arrow.transform.rotation = 0;
			arrow.image.disable();
			directions.pop();
		};
		
		app.clear_arrow_slot = function (is_instant) {
			current_slot_index = 0;
			if (is_instant){
				arrows.forEach (function (arrow) {
					arrow.image.disable();
				});
			}
			else {
				arrows.forEach (function (arrow) {
					animator.fadeOut(arrow.transform, 0.5, function(){
						arrow.image.disable();
						arrow.transform.alpha = 1;
					});
				});
			}


			directions = [];
		};
		
		app.fill_arrow_slot = function (direction_index) {
			let arrow = arrows[current_slot_index];
			directions.push(direction_index);
			current_slot_index++;

			arrow.transform.rotation = direction_index * 45;
			arrow.image.enable();
			//console.log(slot);
		};
		
		app.get_filled_slot_directions = function() {
			return directions.slice(0);
		}
		
	}

	function create_run_button () {
		var xpos = cf.canvasWidth - 115;
		var ypos = cf.canvasHeight - 90;
		var startx = 75;
		
		var specs 				= {
			path            		: "images/run.png",
			sprite_array  			: [0],
			sprite_column_number  	: 2,
			sprite_row_number		: 1,
			x 						: xpos,
			y 						: ypos,
			anchor_ratio_x 			: 0.5,
			anchor_ratio_y			: 0.5,
			scaleX : 0.4,
			scaleY : 0.4
		};
		var button 				= cm.createSprite(specs);
		var tf 					= button.transform;
		var sp 					= button.sprite;

		// sp.disable();
		function start_mouse_down(x, y){
			if (sp.isDisabled) return;
			let rx      = (x - tf.x + sp.width * specs.anchor_ratio_x);
			let ry      = (y - tf.y + sp.height * specs.anchor_ratio_y);
			if( rx>= 0 && ry >=0 && rx <= sp.width  && ry <= sp.height) {
				sp.goTo(1);
				canvas.addEventListener(0, "MOUSE_UP", start_mouse_up);
			}
		}
		function start_mouse_up(x, y) {
			sp.goTo(0);
			let directions = app.get_filled_slot_directions();
			console.log(directions);
			app.create_snapdot_path(directions, function(){
				let result = app.check_answer(directions);
				if (result) {
					app.show_correct_flag();
					app.clear_arrow_slot();
					app.destroy_snapdot_path();
					
					setTimeout(app.go_to_next_level, 2000);
				}
				else {
					app.show_false_flag();
					app.clear_arrow_slot();
					app.destroy_snapdot_path();
					app.reset_snapdot_pen_pos();
					// return pencil to initial position
				}
			});
			//app.clear_arrow_slot();
			canvas.removeEventListener("MOUSE_UP", start_mouse_up);
		}
		canvas.addEventListener(0, "MOUSE_DOWN", start_mouse_down);
	}
	
	function create_arrow_inputs() {
		var spacing = 72;
		var arrow_buttons = [];
		var ypos = cf.canvasHeight - 125;
		var startx = 500;
		
		for (var i = 0; i < 8; i++) {
			if (i < 4) {
				create_arrow_button(startx + i * spacing, ypos, i * 45);			
			}
			else {
				create_arrow_button(startx + (i-4) * spacing, ypos + spacing, i * 45);			
			}

		}

		create_backspace_button(startx + 4 * spacing, ypos, 0);		
		create_clean_button(startx + 4 * spacing, ypos + spacing, 0);
		
		function create_arrow_button(x, y, rotation) {
			var specs 				= {
				path            		: "images/arrow.png",
				sprite_array  			: [0],
				sprite_column_number  	: 2,
				sprite_row_number		: 1,
				x : x,
				y : y,
				anchor_ratio_x : 0.5,
				anchor_ratio_y : 0.5				
			};
			
			var button 				= cm.createSprite(specs);
			var tf 					= button.transform;
			var sp 					= button.sprite;
			tf.scaleX = 0.5;
			tf.scaleY = 0.5;
			tf.rotation = rotation;
			arrow_buttons.push(button);
			var direction_index = arrow_buttons.length - 1;

			// sp.disable();
			function start_mouse_down(x, y){
				if (sp.isDisabled) return;
				let rx      = (x - tf.x + sp.width * specs.anchor_ratio_x);
				let ry      = (y - tf.y + sp.height * specs.anchor_ratio_y);
				if( rx>= 0 && ry >=0 && rx <= sp.width  && ry <= sp.height) {
					sp.goTo(1);
					canvas.addEventListener(0, "MOUSE_UP", start_mouse_up);
				}
			}
			
			function start_mouse_up(x, y) {
				sp.goTo(0);
				//console.log("arrow", direction_index, "pressed");
				app.fill_arrow_slot(direction_index);
				canvas.removeEventListener("MOUSE_UP", start_mouse_up);
			}
			
			canvas.addEventListener(0, "MOUSE_DOWN", start_mouse_down);			
		}
		
		function create_backspace_button(x, y, rotation) {
			var specs 				= {
				path            		: "images/backspace.png",
				sprite_array  			: [0],
				sprite_column_number  	: 2,
				sprite_row_number		: 1,
				x : x,
				y : y,
				anchor_ratio_x : 0.5,
				anchor_ratio_y : 0.5				
			};
			
			var button 				= cm.createSprite(specs);
			var tf 					= button.transform;
			var sp 					= button.sprite;
			tf.scaleX = 0.5;
			tf.scaleY = 0.5;
			tf.rotation = rotation;
			arrow_buttons.push(button);
			var direction_index = arrow_buttons.length - 1;

			// sp.disable();
			function start_mouse_down(x, y){
				if (sp.isDisabled) return;
				let rx      = (x - tf.x + sp.width * specs.anchor_ratio_x);
				let ry      = (y - tf.y + sp.height * specs.anchor_ratio_y);
				if( rx>= 0 && ry >=0 && rx <= sp.width  && ry <= sp.height) {
					sp.goTo(1);
					canvas.addEventListener(0, "MOUSE_UP", start_mouse_up);
				}
			}
			
			function start_mouse_up(x, y) {
				sp.goTo(0);
				//console.log("arrow", direction_index, "pressed");
				app.backspace_arrow_slot();
				canvas.removeEventListener("MOUSE_UP", start_mouse_up);
			}
			
			canvas.addEventListener(0, "MOUSE_DOWN", start_mouse_down);			
		}	

		function create_clean_button(x, y, rotation) {
			var specs 				= {
				path            		: "images/clean.png",
				sprite_array  			: [0],
				sprite_column_number  	: 1,
				sprite_row_number		: 1,
				x : x,
				y : y,
				anchor_ratio_x : 0.5,
				anchor_ratio_y : 0.5				
			};
			
			var button 				= cm.createSprite(specs);
			var tf 					= button.transform;
			var sp 					= button.sprite;
			tf.scaleX = 0.5;
			tf.scaleY = 0.5;
			tf.rotation = rotation;
			arrow_buttons.push(button);
			var direction_index = arrow_buttons.length - 1;

			// sp.disable();
			function start_mouse_down(x, y){
				if (sp.isDisabled) return;
				let rx      = (x - tf.x + sp.width * specs.anchor_ratio_x);
				let ry      = (y - tf.y + sp.height * specs.anchor_ratio_y);
				if( rx>= 0 && ry >=0 && rx <= sp.width  && ry <= sp.height) {
					//sp.goTo(1);
					canvas.addEventListener(0, "MOUSE_UP", start_mouse_up);
				}
			}
			
			function start_mouse_up(x, y) {
				//sp.goTo(0);
				//console.log("arrow", direction_index, "pressed");
				app.clear_arrow_slot(true);
				canvas.removeEventListener("MOUSE_UP", start_mouse_up);
			}
			
			canvas.addEventListener(0, "MOUSE_DOWN", start_mouse_down);			
		}			
	}
	
	function create_next_button () {
		var specs 				= {
			path            		: "images/next.png",
			sprite_array  			: [0],
			sprite_column_number  	: 2,
			sprite_row_number		: 1,
			x 						: cf.canvasWidth/2,
			y 						: cf.canvasHeight/2 - 120,
			anchor_ratio_x 			: 0.5,
			anchor_ratio_y			: 0.5
		};
		var button 				= cm.createSprite(specs);
		var tf 					= button.transform;
		var sp 					= button.sprite;

		sp.disable();
		
		function start_mouse_down(x, y){
			if (sp.isDisabled) return;
			let rx      = (x - tf.x + sp.width * specs.anchor_ratio_x);
			let ry      = (y - tf.y + sp.height * specs.anchor_ratio_y);
			if( rx>= 0 && ry >=0 && rx <= sp.width  && ry <= sp.height) {
				sp.goTo(1);
				canvas.addEventListener(0, "MOUSE_UP", start_mouse_up);
			}
		}
		
		function start_mouse_up(x, y) {
			sp.goTo(0);
			canvas.removeEventListener("MOUSE_UP", start_mouse_up);
		}
		
		canvas.addEventListener(0, "MOUSE_DOWN", start_mouse_down);
		
		app.show_next_button = function () {
			sp.enable();
		};
		
		app.hide_next_button = function () {
			sp.disable();
		};
	}
	
	function create_check_flag () {
		var correct_flag = cm.createImage ({
			path : "images/correct.png",
			x : cf.canvasWidth/2 + 350,
			y : cf.canvasWidth/2 - 143,
			anchorX			: 75.25,
			anchorY			: 71,
			layerIndex		: 0
		});
		correct_flag.image.disable();

		var false_flag = cm.createImage ({
			path : "images/false.png",
			x : cf.canvasWidth/2 + 340,
			y : cf.canvasWidth/2 - 130,
			anchorX			: 71,
			anchorY			: 71,
			layerIndex		: 0
		});
		correct_flag.image.disable();
		false_flag.image.disable();

		app.show_correct_flag = function () {
			correct_flag.image.enable();
			//propagator.riseSubscriber(correct_flag.image);
			correct_flag.transform.alpha = 1;
			animator.zoomOut(correct_flag.transform, 0.2, function() {
				setTimeout(function(){
					animator.fadeOut(correct_flag.transform, 0.5);
				}, 500);
			});
		};
		
		app.show_false_flag = function () {
			false_flag.image.enable();
			false_flag.transform.alpha = 1;
			//propagator.riseSubscriber(false_flag.image);
			animator.zoomOut (false_flag.transform, 0.2, function(){
				setTimeout(function(){
					animator.fadeOut(false_flag.transform, 0.5);
				}, 500);
			});
		};
	}
	
	function get_indexed_directions (wind_directions) {
		let dirs = [];
		wind_directions.forEach (function (wind) {
			switch (wind) {
				case "e":
					dirs.push(0);
					break;
				case "se":
					dirs.push(1);
					break;
				case "s":
					dirs.push(2);
					break;
				case "sw":
					dirs.push(3);
					break;
				case "w":
					dirs.push(4);
					break;
				case "nw":
					dirs.push (5);
					break;
				case "n":
					dirs.push(6);
					break;
				case "ne":
					dirs.push(7);
					break;					
			}
		});
		return dirs;
	}
	
function get_rev_indexed_directions (wind_directions) {
		let dirs = [];
		let rev_wind_directions = wind_directions.reverse();
		rev_wind_directions.forEach (function (wind) {
			switch (wind) {
				case "w":
					dirs.push(0);
					break;
				case "nw":
					dirs.push(1);
					break;
				case "n":
					dirs.push(2);
					break;
				case "ne":
					dirs.push(3);
					break;
				case "e":
					dirs.push(4);
					break;
				case "se":
					dirs.push (5);
					break;
				case "s":
					dirs.push(6);
					break;
				case "sw":
					dirs.push(7);
					break;					
			}
		});
		return dirs;
	}
	
	
		
	
	// --------------------------------------------------------------- APP FUNCTIONS

	self.setLanguage    	= function (inputLanguage) {
		language        	= inputLanguage;

		update_language();
		function update_language() {
			switch(language) {
				case "en_us":
					en_us();
					break;
				case "en_uk":
					en_uk();
					break;
				case "id":
					id();
					break;
			}
			app.update_language = update_language;

			function en_us() {
			}

			function en_uk() {
			}

			function id() {

			}
		}
	};

	self.start          	= function (inputContainer, inputContainerSize) {
		// start the app
		appContainer    = inputContainer;
		canvas          = cm.createCanvas (appContainer);
		cx           	= canvas.getContext();
		propagator      = cm.createPropagator (cx);
		animator        = cm.createAnimator2d (propagator);

		scenes.push (scene0);
		scenes.push (scene1);
		scenes.push (scene2);

		cm.onImageReady = function() {
			console.log("images ready!");
			propagator.start ();
			currentScene = 1;
			propagator.setScene (currentScene);
			scenes[currentScene] ();
		};
		scenes[0]();
	}

}
