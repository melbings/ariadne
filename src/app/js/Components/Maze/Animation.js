import DirectionHelper from '../../Classes/DirectionHelper';

const _CLONE_START_SCALE = 5;
const _GIVE_UP_TARGET_ALPHA = 0.1;

export default class Animation {

    constructor(avatar, action) {
        this._action = action;
        this._avatar = avatar;
        this._hasFinished = false;
        this._hasStarted = false;
        this._targetValue = null;

        switch (action) {
            case 'N':
                this._remainingDistance = 1;
                break;

            case 'E':
                this._remainingDistance = 1;
                break;

            case 'S':
                this._remainingDistance = 1;
                break;

            case 'W':
                this._remainingDistance = 1;
                break;
            
            case 'L':
                this._remainingDistance = 90;
                break;

            case 'R':
                this._remainingDistance = 90;
                break;
                
            case 'LL':
                this._remainingDistance = 180;
                break;

            case 'RR':
                this._remainingDistance = 180;
                break;

            case 'GIVE_UP':
                this._remainingDistance = this._avatar.getAlpha() - _GIVE_UP_TARGET_ALPHA;
                break;

            case 'CLONE':
                this._remainingDistance = _CLONE_START_SCALE - 1;
                break;
        }

        this._targetDistance = this._remainingDistance;
    }
    
    getAction() {
        return this._action;
    }
    
    getAvatar() {
        return this._avatar;
    }
    
    hasFinished() {
        return this._hasFinished;
    }

    hasStarted() {
        return this._hasStarted;
    }

    perform(animationFrameTime, dt) {
        this._hasStarted = true;

        if (this._remainingDistance <= 0) {
            this._hasFinished = true;
            return;
        }

        let delta = animationFrameTime > 0 ? Math.min((this._targetDistance / animationFrameTime) * dt, this._remainingDistance) : this._remainingDistance;

        switch (this._action) {
            case 'N':
                if (this._targetValue == null) {
                    this._targetValue = this._avatar.getY() - this._targetDistance;
                }

                this._avatar.changePositionBy(0, -delta);
                break;

            case 'E':
                if (this._targetValue == null) {
                    this._targetValue = this._avatar.getX() + this._targetDistance;
                }

                this._avatar.changePositionBy(delta, 0);
                break;

            case 'S':
                if (this._targetValue == null) {
                    this._targetValue = this._avatar.getY() + this._targetDistance;
                }

                this._avatar.changePositionBy(0, delta);
                break;

            case 'W':
                if (this._targetValue == null) {
                    this._targetValue = this._avatar.getX() - this._targetDistance;
                }

                this._avatar.changePositionBy(-delta, 0);
                break;

            case 'L':
            case 'LL':
                if (this._targetValue == null) {
                    this._targetValue = DirectionHelper.constrain(this._avatar.getDirection() - this._targetDistance);
                }

                this._avatar.changeDirectionBy(-delta);
                break;

            case 'R':
            case 'RR':
                if (this._targetValue == null) {
                    this._targetValue = DirectionHelper.constrain(this._avatar.getDirection() + this._targetDistance);
                }

                this._avatar.changeDirectionBy(delta);
                break;

            case 'GIVE_UP':
                if (this._targetValue == null) {
                    this._targetValue = _GIVE_UP_TARGET_ALPHA;
                }

                this._avatar.changeAlphaBy(-delta);
                break;

            case 'CLONE':
                if (this._targetValue == null) {
                    this._avatar.setScale(_CLONE_START_SCALE);
                    this._targetValue = 1;
                }

                this._avatar.changeScaleBy(-delta);
                break;
        }

        this._remainingDistance -= delta;

        if (this._remainingDistance <= 0) {
            this._hasFinished = true;

            switch (this._action) {
                case 'N':
                case 'S':
                    this._avatar.setY(this._targetValue);
                    break;

                case 'E':
                case 'W':
                    this._avatar.setX(this._targetValue);
                    break;

                case 'L':
                case 'R':
                case 'LL':
                case 'RR':
                    this._avatar.setDirection(this._targetValue);
                    break;

                case 'GIVE_UP':
                    this._avatar.setAlpha(this._targetValue);
                    break;

                case 'CLONE':
                    this._avatar.setScale(this._targetValue);
                    break;
            }
        }
    }

    setAvatar(avatar) {
        this._avatar = avatar;
    }

    toString() {
        return '[object Animation: action=' + this._action + ', targetDistance=' + this._targetDistance + ', hasFinished=' + this._hasFinished + ', hasStarted=' + this._hasStarted + ', remainingDistance=' + this._remainingDistance + ', targetValue=' + this._targetValue + ']';
    }

}