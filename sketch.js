let Sketch = {};

Sketch.init = () => {

    try {
        Sketch.on = false;
        Sketch.position = {x: 0, y: 0};
        Sketch.x_cords = [];
        Sketch.y_cords = [];
        Sketch.create_controls();
        Sketch.create_canvas();
        Sketch.create_ctx();

        /*window.addEventListener('resize', e => {
            document.getElementById('canvas_container').innerHTML = null;
            Sketch.init();
        });*/
    } catch (err) {
        alert(err);
    }

}

Sketch.create_controls = () => {

    const div = document.createElement('div');
    div.id = 'canvas_controls';
    
    const reset = document.createElement('button');
    reset.id = 'reset_canvas';
    reset.innerText = 'Reset';
    reset.addEventListener('click', e => {
        Sketch.reset();
    });

    const save = document.createElement('button');
    save.id = 'save_canvas';
    save.innerText = 'Save';
    save.addEventListener('click', e => {
        Sketch.save();
    });

    const close_modal = document.createElement('button');
    close_modal.id = 'delete_canvas';
    close_modal.innerText = 'Delete';
    close_modal.dataset.dismiss = 'modal';

    div.appendChild(reset);
    div.appendChild(save);
    div.appendChild(close_modal);
    document.getElementById('canvas_container').appendChild(div);

}

Sketch.create_canvas = () => {

    Sketch.canvas = document.createElement('canvas');
    Sketch.canvas.id = `canvas_signature`;
    Sketch.canvas.width = document.getElementById('canvas_container').offsetWidth;
    Sketch.canvas.height = 300;

    
    // Events
    /* Mouse events */
    Sketch.canvas.addEventListener('mousedown', e => {
        switch(e.button) {
            case 0:
                Sketch.on = true;
                Sketch.get_position(e);
                break;
            default:
                Sketch.on = false;
        }
    });
    document.addEventListener('mouseup', e => {
        Sketch.on = false;
    });
    Sketch.canvas.addEventListener('mousemove', e => Sketch.draw(e));

    /* Touch events */
    Sketch.canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        Sketch.on = true;
        Sketch.get_position(e);
    });
    document.addEventListener('touchend', e => {
        Sketch.on = false;
    });
    Sketch.canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        Sketch.draw(e);
    });

    document.getElementById('canvas_container').appendChild(Sketch.canvas);

}

Sketch.create_ctx = () => {

    Sketch.ctx = Sketch.canvas.getContext('2d');
    Sketch.ctx.canvas.width = document.getElementById('canvas_container').offsetWidth;
    Sketch.ctx.canvas.height = 300;
    Sketch.ctx.fillStyle = 'white';
    Sketch.ctx.fillRect(0, 0, Sketch.canvas.width, Sketch.canvas.height);

    Sketch.ctx.beginPath();
    Sketch.ctx.rect(25, 25, Sketch.canvas.width - 50, 250);
    Sketch.ctx.stroke();

}

Sketch.get_position = (e) => {

    const rect_pos = Sketch.canvas.getBoundingClientRect();

    let e_x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    let e_y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    Sketch.position.x = e_x - rect_pos.x;
    Sketch.position.y = e_y - rect_pos.y;

    Sketch.x_cords.push(Sketch.position.x);
    Sketch.y_cords.push(Sketch.position.y);

}

Sketch.draw = (e) => {

    if (!Sketch.on) return;

    Sketch.ctx.beginPath();
    Sketch.ctx.lineCap = 'round';
    Sketch.ctx.strokeStyle = 'blue';
    Sketch.ctx.lineWidth = 4;
    Sketch.ctx.moveTo(Sketch.position.x, Sketch.position.y);
    
    Sketch.get_position(e);

    Sketch.ctx.lineTo(Sketch.position.x, Sketch.position.y);
    Sketch.ctx.stroke();

}

Sketch.reset = () => {

    document.getElementById('canvas_container').innerHTML = null;
    Sketch.init();

}

Sketch.crop = () => {
    // 28 is offset of the border(25px) plus some extra to not get part of the border. There is probably a better way though...
    const x_cords = Sketch.x_cords.filter(cord => cord > 28 && cord < Sketch.canvas.width - 28);
    const y_cords = Sketch.y_cords.filter(cord => cord > 28 && cord < Sketch.canvas.height - 28);

    // +/- 2 is due to line width of signature
    let min_x = Math.min(...x_cords) - 2;
    let max_x = Math.max(...x_cords) + 2;
    let min_y = Math.min(...y_cords) - 2;
    let max_y = Math.max(...y_cords) + 2;
    
    Sketch.cropped_canvas = document.createElement('canvas');
    const ctx = Sketch.cropped_canvas.getContext('2d');
    Sketch.cropped_canvas.width = ctx.width = max_x - min_x;
    Sketch.cropped_canvas.height = ctx.height = max_y - min_y;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, Sketch.cropped_canvas.width, Sketch.cropped_canvas.height);
    ctx.drawImage(Sketch.canvas, min_x, min_y, max_x, max_y, 0, 0, max_x, max_y);
}

Sketch.save = () => {
    Sketch.crop();
    const url = Sketch.cropped_canvas.toBlob(blob => {   
        let reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const event = new CustomEvent('canvas_saved', {
                detail: {
                    src: reader.result
                }
            });
            document.body.dispatchEvent(event);
        }
    }, 'image/jpeg');
}
