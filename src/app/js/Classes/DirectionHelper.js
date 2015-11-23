export default class DirectionHelper {
    
    static constrain(direction) {
        if (direction >= 360) {
            direction -= 360;
        } else if (direction < 0) {
            direction += 360;
        }

        return direction;
    }
    
}