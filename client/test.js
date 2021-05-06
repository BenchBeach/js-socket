import cp from 'child_process'

let audioplay=cp.spawnSync(`sox`,['./ClientCache/output.raw','-t','waveaudio'])