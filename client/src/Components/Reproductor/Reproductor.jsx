import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMusic } from "../../store/action";
import music from "../../../public/music.svg";
import volume from "../../../public/volume.svg";
import volumeM from "../../../public/volumeM.svg";
import play from "../../../public/play.svg";
import pause from "../../../public/pause.svg";
import next from "../../../public/next.svg";
import "./Reproductor.scss";

function Reproductor({ url }) {
  const dispatch = useDispatch();
  const musicaAct = useSelector((state) => state.act);
  const [audio, setAudio] = useState(new Audio());
  const [p, setP] = useState(true);
  const [ms, setMs] = useState(true);
  const musica = useRef();
  const input = useRef();
  const [duration, setDuration] = useState(0);
  const [value, setValue] = useState(0);

  const handleChangeTime = (e) => {
    setDuration(musica.current.duration);
    let numero = Math.floor(input.current.value);
    input.current.value = e.target.currentTime;
    input.current.max = musica.current.duration;
    if (numero !== value) {
      setValue(Math.floor(input.current.value));
    }
  };

  const handleChangeInput = (e) => {
    musica.current.currentTime = e.target.value;
  };

  const handleChangeVolument = (e) => {
    musica.current.volume = e.target.value * 0.01;
  };

  const playOnPause = () => {
    if (ms) {
      musica.current.pause();
      setMs(false);
    } else {
      musica.current.play();
      setMs(true);
    }
  };

  const time = (num) => {
    const minutos = Math.floor(num / 60);
    const segundos = Math.floor(num % 60);
    if (segundos > 9) return `${minutos}:${segundos}` || "00:00";
    return `${minutos}:0${segundos}` || "00:00";
  };

  useEffect(() => {
    setP(true);
    setMs(true);
    if (musicaAct.musica) {
      const blob = new Blob([musicaAct.buffer], { type: "audio/mp3" });
      setAudio(URL.createObjectURL(blob));
      setP(false);
    }
  }, [musicaAct]);

  return (
    <div className="Reproductor">
      {p ? (
        <h1 className="sinMusic">Seleccione una musica</h1>
      ) : (
        <>
          <div className="cd-1-act">
            <div className="volument">
              <div className="v">
                <img src={volume} width={20} height={20} alt="" />
                <input
                  onChange={handleChangeVolument}
                  type="range"
                  className="volumentMusic"
                  min={0}
                  defaultValue={100}
                  max={100}
                />
                <img src={volumeM} width={20} height={20} alt="" />
              </div>
              <div className="shadow"></div>
            </div>
            <div className="imgMusic">
              <img src={music} className={ms ? "musicaPlay" : null} />
            </div>

            <h1 className="title">
              {musicaAct.musica.value.name.slice(
                0,
                musicaAct.musica.value.name.length - 4
              )}
            </h1>

            <audio
              className="musica"
              ref={musica}
              onEnded={() => dispatch(setMusic(musicaAct.musica.next))}
              autoPlay
              onTimeUpdate={handleChangeTime}
              src={audio}
            ></audio>
          </div>
          <div className="cd-2-sct">
            <div className="time">
              <label>{time(value)}</label>
              <label>{duration ? time(duration) : "00:00"}</label>
            </div>
            <input
              type="range"
              className="rangeMusic"
              ref={input}
              onChange={handleChangeInput}
              min={0}
              max={duration}
            />

            <div className="botones">
              <button
                disabled={!musicaAct.musica.prevoius}
                onClick={() =>
                  dispatch(setMusic(musicaAct.musica.prevoius, url))
                }
              >
                <img
                  src={next}
                  width={30}
                  height={30}
                  style={{ transform: "rotateY(180deg)" }}
                  alt=""
                />
              </button>

              {ms ? (
                <button onClick={playOnPause} className="playAndStop">
                  <img src={pause} alt="" />
                </button>
              ) : (
                <button onClick={playOnPause} className="playAndStop">
                  <img src={play} alt="" />
                </button>
              )}

              <button
                disabled={!musicaAct.musica.next}
                onClick={() => dispatch(setMusic(musicaAct.musica.next, url))}
              >
                <img src={next} width={30} height={30} alt="" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reproductor;
