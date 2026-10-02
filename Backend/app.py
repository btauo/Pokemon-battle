from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database import Database

app = Flask(__name__, static_folder='../Frontend', static_url_path='')
CORS(app)
db = Database()

# ========== API ==========

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    result = db.register(data['username'], data['password'])
    return jsonify(result)

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    result = db.login(data['username'], data['password'])
    return jsonify(result)

@app.route('/api/players', methods=['GET'])
def api_players():
    player_id = request.args.get('player_id')
    result = db.get_all_players(player_id)
    return jsonify(result)

@app.route('/api/player/stats', methods=['GET'])
def api_stats():
    player_id = request.args.get('player_id')
    result = db.get_player_stats(player_id)
    return jsonify(result)

@app.route('/api/player/pokemons', methods=['GET'])
def api_player_pokemons():
    player_id = request.args.get('player_id')
    result = db.get_player_pokemons(player_id)
    return jsonify(result)

@app.route('/api/player/status', methods=['POST'])
def api_set_status():
    data = request.json
    result = db.set_status(data['player_id'], data['status'])
    return jsonify(result)

@app.route('/api/pokemonSkills', methods=['GET'])
def api_pokemon_skills():
    result = db.pokemonSkills()
    return jsonify(result)

@app.route('/api/battle/create', methods=['POST'])
def api_create_battle():
    data = request.json
    result = db.create_battle(data['player1_id'], data['player2_id'])
    return jsonify(result)

@app.route('/api/battle/set_team', methods=['POST'])
def api_set_team():
    data = request.json
    result = db.set_team(
        data['battle_id'], data['player_id'],
        data['pokemon1_id'], data['pokemon2_id'], data['pokemon3_id']
    )
    return jsonify(result)

@app.route('/api/battle/attack', methods=['POST'])
def api_attack():
    data = request.json
    result = db.perform_attack(data['battle_id'], data['player_id'], data['attack_id'])
    return jsonify(result)

@app.route('/api/battle/async/start', methods=['POST'])
def api_start_async_battle():
    data = request.json
    result = db.start_async_battle(data['player1_id'], data['player2_id'], data['team1'])
    return jsonify(result)

@app.route('/api/battle/info', methods=['GET'])
def api_battle_info():
    battle_id = request.args.get('battle_id')
    player_id = request.args.get('player_id')
    result = db.get_battle_info(battle_id, player_id)
    return jsonify(result)

@app.route('/api/battle/enemy-attack', methods=['POST'])
def api_enemy_attack():
    data = request.json
    result = db.enemy_random_attack(data['battle_id'], data['enemy_id'])
    return jsonify(result)

@app.route('/api/battle/end', methods=['POST'])
def api_end_battle():
    data = request.json
    result = db.end_battle(
        data['battle_id'],
        data['winner_id'],
        data['loser_id']
    )
    return jsonify(result)

@app.route('/api/battle/switch-pokemon', methods=['POST'])
def api_switch_pokemon():
    data = request.json
    result = db.switch_pokemon(
        data['battle_id'],
        data['player_id'],
        data['pokemon_id']
    )
    return jsonify(result)

@app.route('/api/battle/enemy-switch', methods=['POST'])
def api_enemy_switch():
    data = request.json
    result = db.enemy_auto_switch(
        data['battle_id'],
        data['enemy_id']
    )
    return jsonify(result)

@app.route('/api/player/my-pokemons', methods=['GET'])
def api_my_pokemons():
    player_id = request.args.get('player_id')
    result = db.get_player_pokemons(player_id)
    return jsonify(result)

@app.route('/api/battle/challenge', methods=['POST'])
def api_challenge():
    data = request.json
    result = db.challenge_player(data['challenger_id'], data['target_id'], data['team'])
    return jsonify(result)

@app.route('/api/battle/check', methods=['GET'])
def api_check():
    player_id = request.args.get('player_id')
    result = db.check_challenge(player_id)
    return jsonify(result)

@app.route('/api/battle/accept', methods=['POST'])
def api_accept():
    data = request.json
    result = db.accept_challenge(data['battle_id'], data['player_id'], data['team'])
    return jsonify(result)

@app.route('/api/battle/cancel', methods=['POST'])
def api_cancel():
    data = request.json
    result = db.cancel_challenge(data['battle_id'])
    return jsonify(result)

@app.route('/api/battle/check-start', methods=['GET'])
def api_check_start():
    player_id = request.args.get('player_id')
    result = db.check_battle_start(player_id)
    return jsonify(result)

@app.route('/api/battle/check-turn', methods=['GET'])
def api_check_turn():
    battle_id = request.args.get('battle_id')
    player_id = request.args.get('player_id')
    last_turn = request.args.get('last_turn')
    result = db.check_enemy_turn(battle_id, player_id, last_turn)
    return jsonify(result)

@app.route('/api/battle/use-potion', methods=['POST'])
def api_use_potion():
    data = request.json
    result = db.use_potion(data['player_id'], data['item_id'], data['battle_id'])
    return jsonify(result)

@app.route('/api/inventory', methods=['GET'])
def api_inventory():
    player_id = request.args.get('player_id')
    result = db.get_inventory(player_id)
    return jsonify(result)

@app.route('/api/shop/buy', methods=['POST'])
def api_buy_item():
    data = request.json
    result = db.buy_item(data['player_id'], data['item_id'])
    return jsonify(result)
# ========== СТАТИКА ==========

@app.route('/')
def index():
    return send_from_directory('../Frontend/loginForm', 'login.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('../Frontend', filename)

if __name__ == '__main__':
    print("Сервер запущен на http://localhost:5000")
    app.run(port=5000, debug=False)