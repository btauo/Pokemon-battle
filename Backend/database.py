import sqlite3
import json

class Database:
    def __init__(self):
        import os
        folder = os.path.dirname(os.path.abspath(__file__))
        self.db_path = os.path.join(folder, 'pokemon.db')
        self.create_tables()
        self.fill_data()
    
    def connect(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    
    def create_tables(self):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.executescript('''
            CREATE TABLE IF NOT EXISTS Игрок (
                id_игрока INTEGER PRIMARY KEY AUTOINCREMENT,
                имя TEXT NOT NULL UNIQUE,
                пароль TEXT NOT NULL,
                уровень_игрока INTEGER DEFAULT 1,
                опыт_игрока INTEGER DEFAULT 0,
                победы INTEGER DEFAULT 0,
                поражения INTEGER DEFAULT 0,
                всего_боёв INTEGER DEFAULT 0,
                монеты INTEGER DEFAULT 5000,
                рейтинг INTEGER DEFAULT 1000,
                статус TEXT DEFAULT 'offline',
                дата_регистрации TEXT DEFAULT (datetime('now')),
                всего_урона_нанесено INTEGER DEFAULT 0
            );
            
            CREATE TABLE IF NOT EXISTS Покемоны (
                id_покемона INTEGER PRIMARY KEY AUTOINCREMENT,
                имя TEXT NOT NULL,
                стихия TEXT NOT NULL,
                базовое_hp INTEGER NOT NULL,
                базовая_атака INTEGER NOT NULL,
                базовая_защита INTEGER NOT NULL,
                базовая_скорость INTEGER NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS Атаки (
                id_атаки INTEGER PRIMARY KEY AUTOINCREMENT,
                название TEXT NOT NULL,
                стихия TEXT NOT NULL,
                сила INTEGER NOT NULL,
                точность INTEGER DEFAULT 100,
                количество_pp INTEGER NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS Атаки_покемонов (
                id_связи INTEGER PRIMARY KEY AUTOINCREMENT,
                id_покемона INTEGER NOT NULL,
                id_атаки INTEGER NOT NULL,
                уровень_изучения INTEGER DEFAULT 1,
                FOREIGN KEY(id_покемона) REFERENCES Покемоны(id_покемона),
                FOREIGN KEY(id_атаки) REFERENCES Атаки(id_атаки)
            );
            
            CREATE TABLE IF NOT EXISTS Покемоны_игрока (
                id_покемона_игрока INTEGER PRIMARY KEY AUTOINCREMENT,
                id_покемона INTEGER NOT NULL,
                id_игрока INTEGER NOT NULL,
                никнейм TEXT,
                уровень INTEGER DEFAULT 1,
                текущее_hp INTEGER,
                текущий_опыт INTEGER DEFAULT 0,
                FOREIGN KEY(id_покемона) REFERENCES Покемоны(id_покемона),
                FOREIGN KEY(id_игрока) REFERENCES Игрок(id_игрока)
            );
            
            CREATE TABLE IF NOT EXISTS Предметы (
                id_предмета INTEGER PRIMARY KEY AUTOINCREMENT,
                название TEXT NOT NULL,
                тип TEXT NOT NULL,
                эффект INTEGER NOT NULL,
                описание TEXT,
                стоимость INTEGER DEFAULT 100
            );
            
            CREATE TABLE IF NOT EXISTS Инвентарь (
                id_инвентаря INTEGER PRIMARY KEY AUTOINCREMENT,
                id_игрока INTEGER NOT NULL,
                id_предмета INTEGER NOT NULL,
                количество INTEGER DEFAULT 1,
                FOREIGN KEY(id_игрока) REFERENCES Игрок(id_игрока),
                FOREIGN KEY(id_предмета) REFERENCES Предметы(id_предмета)
            );
            
            CREATE TABLE IF NOT EXISTS Игровая_сессия (
                id_сессии INTEGER PRIMARY KEY AUTOINCREMENT,
                id_игрока1 INTEGER NOT NULL,
                id_игрока2 INTEGER NOT NULL,
                статус TEXT DEFAULT 'waiting',
                текущий_ход INTEGER DEFAULT 0,
                победитель INTEGER,
                FOREIGN KEY(id_игрока1) REFERENCES Игрок(id_игрока),
                FOREIGN KEY(id_игрока2) REFERENCES Игрок(id_игрока)
            );
            
            CREATE TABLE IF NOT EXISTS Покемон_в_бою (
                id_покемона_в_бою INTEGER PRIMARY KEY AUTOINCREMENT,
                id_сессии INTEGER NOT NULL,
                id_покемона_игрока INTEGER NOT NULL,
                id_игрока INTEGER NOT NULL,
                текущее_hp INTEGER NOT NULL,
                статус_в_бою TEXT DEFAULT 'active',
                позиция INTEGER DEFAULT 1,
                FOREIGN KEY(id_сессии) REFERENCES Игровая_сессия(id_сессии),
                FOREIGN KEY(id_покемона_игрока) REFERENCES Покемоны_игрока(id_покемона_игрока)
            );
            
            CREATE TABLE IF NOT EXISTS Ход_боя (
                id_хода INTEGER PRIMARY KEY AUTOINCREMENT,
                id_сессии INTEGER NOT NULL,
                номер_хода INTEGER NOT NULL,
                id_игрока INTEGER NOT NULL,
                id_защищающегося INTEGER NOT NULL,
                id_атаки INTEGER NOT NULL,
                урон INTEGER DEFAULT 0,
                FOREIGN KEY(id_сессии) REFERENCES Игровая_сессия(id_сессии)
            );
        ''')
        
        conn.commit()
        conn.close()
    
    def fill_data(self):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM Покемоны")
        if cursor.fetchone()[0] == 0:
            cursor.executescript('''
                INSERT INTO Покемоны (имя, стихия, базовое_hp, базовая_атака, базовая_защита, базовая_скорость) VALUES
                    ('Bulbasaur', 'grass', 45, 49, 49, 45),
                    ('Charmander', 'fire', 39, 52, 43, 65),
                    ('Squirtle', 'water', 44, 48, 65, 43),
                    ('Pikachu', 'electric', 35, 55, 40, 90),
                    ('Eevee', 'normal', 55, 55, 50, 55),
                    ('Magikarp', 'water', 20, 10, 55, 80);
                
                INSERT INTO Атаки (название, стихия, сила, точность, количество_pp) VALUES
                    ('Tackle', 'normal', 40, 95, 35),
                    ('Vine Whip', 'grass', 45, 100, 25),
                    ('Razor Leaf', 'grass', 55, 95, 25),
                    ('Seed Bomb', 'grass', 80, 100, 15),
                    ('Scratch', 'normal', 40, 100, 35),
                    ('Ember', 'fire', 40, 100, 25),
                    ('Fire Fang', 'fire', 65, 95, 25),
                    ('Flamethrower', 'fire', 90, 100, 15),
                    ('Ice Gun', 'ice', 40, 100, 25),
                    ('Bubble Beam', 'water', 65, 100, 20),
                    ('Aqua Tail', 'water', 90, 90, 10),
                    ('Quick Attack', 'normal', 40, 100, 30),
                    ('Thunder Shock', 'electric', 40, 100, 30),
                    ('Thunderbolt', 'electric', 90, 100, 15),
                    ('Iron Tail', 'steel', 100, 75, 15),
                    ('Bite', 'dark', 50, 100, 25),
                    ('Body Slam', 'normal', 40, 100, 30),
                    ('Swift', 'normal', 60, 100, 20),
                    ('Dig', 'ground', 80, 100, 10),
                    ('Splash', 'normal', 0, 100, 40),
                    ('Water Beam', 'water', 60, 100, 15),
                    ('Water Shot', 'water', 85, 100, 10);
                
                INSERT INTO Атаки_покемонов (id_покемона, id_атаки) VALUES
                    (1, 1), (1, 2), (1, 3), (1, 4),
                    (2, 5), (2, 6), (2, 7), (2, 8),
                    (3, 1), (3, 9), (3, 10), (3, 11),
                    (4, 12), (4, 13), (4, 14), (4, 15),
                    (5, 16), (5, 17), (5, 18), (5, 19),
                    (6, 1), (6, 20), (6, 21), (6, 22);
                
                INSERT INTO Предметы (название, тип, эффект, описание, стоимость) VALUES
                    ('Малое зелье', 'heal', 10, 'Восстанавливает 10 HP', 100),
                    ('Среднее зелье', 'heal', 20, 'Восстанавливает 20 HP', 300),
                    ('Большое зелье', 'heal', 35, 'Восстанавливает 35 HP', 800);
            ''')
        
        conn.commit()
        conn.close()
    
    # ========== АВТОРИЗАЦИЯ ==========
    
    def register(self, username, password):
        conn = self.connect()
        cursor = conn.cursor()
        
        # Проверка имени + создание игрока одним SQL (INSERT OR IGNORE)
        cursor.execute("INSERT OR IGNORE INTO Игрок (имя, пароль) VALUES (?, ?)", [username, password])
        
        if cursor.rowcount == 0:
            conn.close()
            return {"status": "error", "message": "Имя занято"}
        
        player_id = cursor.lastrowid
        
        cursor.execute('''
            INSERT INTO Покемоны_игрока (id_покемона, id_игрока, текущее_hp)
            SELECT id_покемона, ?, базовое_hp FROM Покемоны
        ''', [player_id])
        
        cursor.execute('''
            INSERT INTO Инвентарь (id_игрока, id_предмета, количество)
            SELECT ?, id_предмета, CASE id_предмета 
                WHEN 1 THEN 3 
                WHEN 2 THEN 2 
                WHEN 3 THEN 1 
            END
            FROM Предметы
        ''', [player_id])
        
        conn.commit()
        conn.close()
        return {"status": "ok", "player_id": player_id, "username": username}
    
    def login(self, username, password):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id_игрока, имя FROM Игрок WHERE имя = ? AND пароль = ?",
            [username, password]
        )
        result = cursor.fetchone()
        
        if result:
            # Обновляем статус на online
            cursor.execute("UPDATE Игрок SET статус = 'afk' WHERE id_игрока = ?", [result[0]])
            conn.commit()
            conn.close()
            return {"status": "ok", "player_id": result[0], "username": result[1]}
        
        conn.close()
        return {"status": "error", "message": "Неверный логин или пароль"}
    
#==============================================Menu==============================================#
    def set_status(self, player_id, status):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE Игрок SET статус = ?
            WHERE id_игрока = ? 
            AND ? IN ('afk', 'offline', 'ready', 'in-battle')
        ''', [status, player_id, status])
        
        if cursor.rowcount == 0:
            conn.close()
            return {'status': 'error', 'message': f'Недопустимый статус: {status}'}
        
        conn.commit()
        conn.close()
        return {'status': 'ok', 'player_status': status}

    def get_all_players(self, current_player_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT json_group_array(
                json_object(
                    'id', id_игрока,
                    'имя', имя,
                    'уровень', уровень_игрока,
                    'победы', победы,
                    'поражения', поражения,
                    'статус', статус,
                    'рейтинг', рейтинг
                )
            )
            FROM (
                SELECT id_игрока, имя, уровень_игрока, победы, поражения, статус, рейтинг
                FROM Игрок
                WHERE id_игрока != ?
                ORDER BY уровень_игрока DESC
            )
        ''', [current_player_id])
        
        result = cursor.fetchone()
        conn.close()
        
        return {'players': json.loads(result[0])}
    
    def get_player_stats(self, player_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT имя, уровень_игрока, опыт_игрока, победы, поражения,
                всего_боёв, монеты, рейтинг, статус, дата_регистрации
            FROM Игрок
            WHERE id_игрока = ?
        ''', [player_id])
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                'имя': result[0],
                'уровень': result[1],
                'опыт': result[2],
                'победы': result[3],
                'поражения': result[4],
                'всего_боёв': result[5],
                'монеты': result[6],
                'рейтинг': result[7],
                'статус': result[8], 
                'дата_регистрации': result[9]
            }
        return {'status': 'error'}

    def get_player_pokemons(self, player_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            WITH RECURSIVE 
            levels(i) AS (
                SELECT 1
                UNION ALL
                SELECT i + 1 FROM levels WHERE i < 99
            ),
            exp_table(level, total_exp_needed) AS (
                SELECT 
                    l.i,
                    (SELECT COALESCE(SUM(i * 100), 0) FROM levels WHERE i < l.i)
                FROM levels l
            )
            SELECT json_group_array(
                json_object(
                    'имя', п.имя,
                    'уровень', пп.уровень,
                    'опыт', пп.текущий_опыт - COALESCE(e.total_exp_needed, 0),
                    'опыт_до_след_уровня', пп.уровень * 100
                )
            )
            FROM Покемоны_игрока пп
            JOIN Покемоны п ON пп.id_покемона = п.id_покемона
            LEFT JOIN exp_table e ON e.level = пп.уровень
            WHERE пп.id_игрока = ?
        ''', [player_id])
        
        result = cursor.fetchone()
        conn.close()
        
        return {'pokemons': json.loads(result[0])}








    

    
#==============================================PokemonBattle==============================================#    
    def pokemonSkills(self):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT json_group_array(
                json_object(
                    'pokemonName', имя,
                    'skills', skills_json
                )
            )
            FROM (
                SELECT 
                    п.имя AS имя,
                    (
                        SELECT json_group_array(
                            json_object(
                                'id', a.id_атаки,
                                'name', a.название,
                                'type', a.стихия,
                                'base_power', a.сила,
                                'accuracy', a.точность || '%',
                                'amount', a.количество_pp
                            )
                        )
                        FROM Атаки a
                        JOIN Атаки_покемонов ap ON a.id_атаки = ap.id_атаки
                        WHERE ap.id_покемона = п.id_покемона
                    ) AS skills_json
                FROM Покемоны п
            )
        ''')
        
        result = cursor.fetchone()
        conn.close()
        
        data = json.loads(result[0])
        # Парсим вложенный skills для каждого покемона
        for pokemon in data:
            pokemon['skills'] = json.loads(pokemon['skills'])
        
        return data
    
    def add_exp_to_pokemon(self, pokemon_id, exp_gained):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            WITH RECURSIVE levels(i) AS (
                SELECT 1
                UNION ALL
                SELECT i + 1 FROM levels WHERE i < 99
            )
            UPDATE Покемоны_игрока
            SET 
                уровень = уровень + CASE 
                    WHEN (текущий_опыт + ?) >= (
                        SELECT COALESCE(SUM(i * 100), 0) 
                        FROM levels 
                        WHERE i <= (SELECT уровень FROM Покемоны_игрока WHERE id_покемона_игрока = ?)
                    )
                    THEN 1 
                    ELSE 0 
                END,
                текущий_опыт = текущий_опыт + ?
            WHERE id_покемона_игрока = ?
        ''', [exp_gained, pokemon_id, exp_gained, pokemon_id])
        
        cursor.execute('SELECT уровень, текущий_опыт FROM Покемоны_игрока WHERE id_покемона_игрока = ?', [pokemon_id])
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        
        return {
            'status': 'ok',
            'new_level': row[0],
            'new_exp': row[1],
            'level_up': True,
            'exp_gained': exp_gained
        }
    
    # ========== БОЙ ==========

    def get_battle_info(self, battle_id, player_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                с.id_игрока1,
                с.id_игрока2,
                и1.имя AS p1_name,
                и2.имя AS p2_name,
                (
                    SELECT json_group_array(json_object(
                        'id', пб.id_покемона_в_бою,
                        'имя', п.имя,
                        'стихия', п.стихия,
                        'уровень', пп.уровень,
                        'текущее_hp', пб.текущее_hp,
                        'базовое_hp', п.базовое_hp,
                        'атака', п.базовая_атака,
                        'защита', п.базовая_защита,
                        'скорость', п.базовая_скорость,
                        'статус', пб.статус_в_бою
                    ))
                    FROM Покемон_в_бою пб
                    JOIN Покемоны_игрока пп ON пб.id_покемона_игрока = пп.id_покемона_игрока
                    JOIN Покемоны п ON пп.id_покемона = п.id_покемона
                    WHERE пб.id_сессии = с.id_сессии AND пб.id_игрока = ?
                ) AS my_team,
                (
                    SELECT json_group_array(json_object(
                        'id', пб.id_покемона_в_бою,
                        'имя', п.имя,
                        'стихия', п.стихия,
                        'уровень', пп.уровень,
                        'текущее_hp', пб.текущее_hp,
                        'базовое_hp', п.базовое_hp,
                        'атака', п.базовая_атака,
                        'защита', п.базовая_защита,
                        'скорость', п.базовая_скорость,
                        'статус', пб.статус_в_бою
                    ))
                    FROM Покемон_в_бою пб
                    JOIN Покемоны_игрока пп ON пб.id_покемона_игрока = пп.id_покемона_игрока
                    JOIN Покемоны п ON пп.id_покемона = п.id_покемона
                    WHERE пб.id_сессии = с.id_сессии AND пб.id_игрока != ?
                ) AS enemy_team
            FROM Игровая_сессия с
            JOIN Игрок и1 ON с.id_игрока1 = и1.id_игрока
            JOIN Игрок и2 ON с.id_игрока2 = и2.id_игрока
            WHERE с.id_сессии = ?
        ''', [player_id, player_id, battle_id])
        
        row = cursor.fetchone()
        conn.close()
        
        
        return {
            'my_team': json.loads(row[4]),
            'enemy_team': json.loads(row[5]),
            'player1_id': row[0],
            'player2_id': row[1],
            'player1_name': row[2],
            'player2_name': row[3]
        }
    
    def create_battle(self, player1_id, player2_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO Игровая_сессия (id_игрока1, id_игрока2) VALUES (?, ?)",
            [player1_id, player2_id]
        )
        battle_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return {'battle_id': battle_id}
    
    def set_team(self, battle_id, player_id, pokemon1_id, pokemon2_id, pokemon3_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO Покемон_в_бою (id_сессии, id_покемона_игрока, id_игрока, текущее_hp, позиция)
            SELECT 
                ?,
                пп.id_покемона_игрока,
                ?,
                пп.текущее_hp,
                CASE пп.id_покемона_игрока 
                    WHEN ? THEN 1
                    WHEN ? THEN 2
                    WHEN ? THEN 3
                END
            FROM Покемоны_игрока пп
            WHERE пп.id_покемона_игрока IN (?, ?, ?)
        ''', [battle_id, player_id, pokemon1_id, pokemon2_id, pokemon3_id,
            pokemon1_id, pokemon2_id, pokemon3_id])
        
        conn.commit()
        conn.close()
        return {'status': 'ok'}
    
    def perform_attack(self, battle_id, player_id, attack_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            WITH new_damage AS (
                SELECT CAST(
                    (p_atk.базовая_атака + p_atk_player.уровень) * a.сила 
                    / (p_def.базовая_защита + p_def_player.уровень) / 5
                    * CASE 
                        WHEN a.стихия='fire' AND p_def.стихия='grass' THEN 2.0
                        WHEN a.стихия='grass' AND p_def.стихия='water' THEN 2.0
                        WHEN a.стихия='water' AND p_def.стихия='fire' THEN 2.0
                        WHEN a.стихия='fire' AND p_def.стихия='water' THEN 0.5
                        WHEN a.стихия='water' AND p_def.стихия='grass' THEN 0.5
                        WHEN a.стихия='grass' AND p_def.стихия='fire' THEN 0.5
                        ELSE 1.0
                    END
                    * (0.85 + ABS(RANDOM() % 16) / 100.0)
                AS INTEGER) AS dmg,
                defender.id_покемона_в_бою AS def_id,
                attacker.id_покемона_в_бою AS atk_id,
                a.название AS attack_name
                FROM Покемон_в_бою attacker
                JOIN Покемоны_игрока p_atk_player ON attacker.id_покемона_игрока = p_atk_player.id_покемона_игрока
                JOIN Покемоны p_atk ON p_atk_player.id_покемона = p_atk.id_покемона
                JOIN Покемон_в_бою defender ON defender.id_сессии = attacker.id_сессии 
                    AND defender.id_игрока != attacker.id_игрока AND defender.статус_в_бою = 'active'
                JOIN Покемоны_игрока p_def_player ON defender.id_покемона_игрока = p_def_player.id_покемона_игрока
                JOIN Покемоны p_def ON p_def_player.id_покемона = p_def.id_покемона
                JOIN Атаки a ON a.id_атаки = ?
                WHERE attacker.id_сессии = ? AND attacker.id_игрока = ? AND attacker.статус_в_бою = 'active'
            )
            INSERT INTO Ход_боя (id_сессии, номер_хода, id_игрока, id_защищающегося, id_атаки, урон)
            SELECT ?, 
                COALESCE((SELECT MAX(номер_хода) FROM Ход_боя WHERE id_сессии = ?), 0) + 1,
                ?, d.def_id, ?, d.dmg
            FROM new_damage d
        ''', [attack_id, battle_id, player_id, battle_id, battle_id, player_id, attack_id])
        
        # Обновляем HP и статус
        cursor.execute('''
            UPDATE Покемон_в_бою
            SET статус_в_бою = CASE 
                    WHEN MAX(0, текущее_hp - (SELECT урон FROM Ход_боя WHERE id_сессии = ? AND номер_хода = (SELECT MAX(номер_хода) FROM Ход_боя WHERE id_сессии = ?))) <= 0 
                    THEN 'fainted' ELSE 'active' 
                END,
                текущее_hp = MAX(0, текущее_hp - (SELECT урон FROM Ход_боя WHERE id_сессии = ? AND номер_хода = (SELECT MAX(номер_хода) FROM Ход_боя WHERE id_сессии = ?)))
            WHERE id_покемона_в_бою = (
                SELECT id_защищающегося FROM Ход_боя 
                WHERE id_сессии = ? AND номер_хода = (SELECT MAX(номер_хода) FROM Ход_боя WHERE id_сессии = ?)
            )
        ''', [battle_id, battle_id, battle_id, battle_id, battle_id, battle_id])
        
        # Обновляем статистику и счётчик
        cursor.execute('''
            UPDATE Игрок SET всего_урона_нанесено = всего_урона_нанесено + 
                (SELECT урон FROM Ход_боя WHERE id_сессии = ? AND номер_хода = (SELECT MAX(номер_хода) FROM Ход_боя WHERE id_сессии = ?))
            WHERE id_игрока = ?
        ''', [battle_id, battle_id, player_id])
        
        cursor.execute("UPDATE Игровая_сессия SET текущий_ход = текущий_ход + 1 WHERE id_сессии = ?", [battle_id])
        
        # Возвращаем результат одним SQL
        cursor.execute('''
            SELECT 
                х.урон,
                а.название,
                пб.текущее_hp,
                пб.статус_в_бою,
                (SELECT п2.имя FROM Покемон_в_бою пб2
                JOIN Покемоны_игрока пи2 ON пб2.id_покемона_игрока = пи2.id_покемона_игрока
                JOIN Покемоны п2 ON пи2.id_покемона = п2.id_покемона
                WHERE пб2.id_сессии = ? AND пб2.id_игрока = ? AND пб2.статус_в_бою = 'active') AS active_pokemon,
                (SELECT COUNT(*) FROM Покемон_в_бою WHERE id_сессии = ? 
                AND id_игрока = (SELECT CASE WHEN id_игрока1 = ? THEN id_игрока2 ELSE id_игрока1 END 
                                FROM Игровая_сессия WHERE id_сессии = ?) AND текущее_hp > 0)
            FROM Ход_боя х
            JOIN Атаки а ON х.id_атаки = а.id_атаки
            JOIN Покемон_в_бою пб ON х.id_защищающегося = пб.id_покемона_в_бою
            JOIN Покемоны_игрока пи ON пб.id_покемона_игрока = пи.id_покемона_игрока
            JOIN Покемоны п ON пи.id_покемона = п.id_покемона
            WHERE х.id_сессии = ? AND х.номер_хода = (SELECT MAX(номер_хода) FROM Ход_боя WHERE id_сессии = ?)
        ''', [battle_id, player_id, battle_id, player_id, battle_id, battle_id, battle_id])
        
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        
        return {
            'status': 'ok',
            'damage': row[0],
            'attack_name': row[1],
            'defender_hp': row[2],
            'defender_fainted': row[3] == 'fainted',
            'active_pokemon': row[4],
            'enemy_all': row[5],
            'enemy_all_fainted': row[5] == 0
        }

    def switch_pokemon(self, battle_id, player_id, pokemon_in_battle_id):
        """Смена активного покемона на выбранного (без проверки на жизнь - проверка на фронте)"""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Проверяем, что покемон существует
        cursor.execute('''
            SELECT текущее_hp, статус_в_бою FROM Покемон_в_бою
            WHERE id_покемона_в_бою = ? AND id_сессии = ? AND id_игрока = ?
        ''', [pokemon_in_battle_id, battle_id, player_id])
        
        result = cursor.fetchone()
        if not result:
            conn.close()
            return {'error': 'Покемон не найден'}
        
        if result[1] == 'active':
            conn.close()
            return {'error': 'Этот покемон уже активен'}
        
        # Убираем активный статус у текущего покемона (если есть)
        cursor.execute('''
            UPDATE Покемон_в_бою SET статус_в_бою = 'bench'
            WHERE id_сессии = ? AND id_игрока = ? AND статус_в_бою = 'active'
        ''', [battle_id, player_id])
        
        # Делаем выбранного покемона активным
        cursor.execute('''
            UPDATE Покемон_в_бою SET статус_в_бою = 'active'
            WHERE id_покемона_в_бою = ? AND id_сессии = ? AND id_игрока = ?
        ''', [pokemon_in_battle_id, battle_id, player_id])
        
        conn.commit()
        conn.close()
        
        return {'status': 'ok', 'message': 'Покемон успешно заменен'}
    
    def end_battle(self, battle_id, winner_id, loser_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        # Проверка
        cursor.execute("SELECT статус FROM Игровая_сессия WHERE id_сессии = ?", [battle_id])
        status = cursor.fetchone()
        if status and status[0] == 'finished':
            conn.close()
            return {'status': 'already_finished'}
        
        cursor.execute('''
            WITH RECURSIVE levels(i) AS (
                SELECT 1
                UNION ALL
                SELECT i + 1 FROM levels WHERE i < 99
            )
            UPDATE Покемоны_игрока
            SET 
                уровень = уровень + CASE 
                    WHEN (текущий_опыт + CASE WHEN id_игрока = ? THEN 100 ELSE 50 END) >= (
                        SELECT COALESCE(SUM(i * 100), 0) 
                        FROM levels 
                        WHERE i <= (SELECT уровень FROM Покемоны_игрока пп2 WHERE пп2.id_покемона_игрока = Покемоны_игрока.id_покемона_игрока)
                    )
                    THEN 1 
                    ELSE 0 
                END,
                текущий_опыт = текущий_опыт + CASE WHEN id_игрока = ? THEN 100 ELSE 50 END
            WHERE id_покемона_игрока IN (
                SELECT id_покемона_игрока FROM Покемон_в_бою WHERE id_сессии = ?
            )
        ''', [winner_id, winner_id, battle_id])
        
        # Статистика — всё в SQL
        cursor.execute('''
            UPDATE Игрок SET 
                победы = победы + 1, 
                всего_боёв = всего_боёв + 1,
                рейтинг = рейтинг + 25, 
                опыт_игрока = опыт_игрока + 50,
                монеты = монеты + 100
            WHERE id_игрока = ?
        ''', [winner_id])
        
        cursor.execute('''
            UPDATE Игрок SET 
                поражения = поражения + 1, 
                всего_боёв = всего_боёв + 1,
                рейтинг = рейтинг - 15, 
                опыт_игрока = опыт_игрока + 20,
                монеты = монеты + 50
            WHERE id_игрока = ?
        ''', [loser_id])
        
        # Очистка и завершение
        cursor.execute('DELETE FROM Ход_боя WHERE id_сессии = ?', [battle_id])
        cursor.execute('DELETE FROM Покемон_в_бою WHERE id_сессии = ?', [battle_id])
        cursor.execute("UPDATE Игровая_сессия SET статус = 'finished', победитель = ? WHERE id_сессии = ?", [winner_id, battle_id])
        
        conn.commit()
        conn.close()
        return {'status': 'ok', 'winner': winner_id, 'loser': loser_id}


#==============================================AsyncBattle==============================================#
    def start_async_battle(self, player1_id, player2_id, team1_names):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO Игровая_сессия (id_игрока1, id_игрока2, статус) VALUES (?, ?, 'async_active')",
            [player1_id, player2_id]
        )
        battle_id = cursor.lastrowid
        
        # Покемоны игрока 1 одним запросом
        placeholders = ','.join('?' * len(team1_names))
        cursor.execute(f'''
            INSERT INTO Покемон_в_бою (id_сессии, id_покемона_игрока, id_игрока, текущее_hp, статус_в_бою, позиция)
            SELECT ?, пп.id_покемона_игрока, ?, пп.текущее_hp,
                CASE WHEN ROW_NUMBER() OVER (ORDER BY пп.id_покемона_игрока) = 1 
                    THEN 'active' ELSE 'bench' END,
                ROW_NUMBER() OVER (ORDER BY пп.id_покемона_игрока)
            FROM Покемоны_игрока пп
            JOIN Покемоны п ON пп.id_покемона = п.id_покемона
            WHERE пп.id_игрока = ? AND п.имя IN ({placeholders})
        ''', [battle_id, player1_id, player1_id] + team1_names)
        
        # Покемоны игрока 2 (случайные)
        cursor.execute('''
            INSERT INTO Покемон_в_бою (id_сессии, id_покемона_игрока, id_игрока, текущее_hp, статус_в_бою, позиция)
            SELECT ?, пп.id_покемона_игрока, ?, пп.текущее_hp,
                CASE WHEN ROW_NUMBER() OVER (ORDER BY RANDOM()) = 1 
                    THEN 'active' ELSE 'bench' END,
                ROW_NUMBER() OVER (ORDER BY RANDOM())
            FROM Покемоны_игрока пп
            WHERE пп.id_игрока = ?
            ORDER BY RANDOM()
            LIMIT 3
        ''', [battle_id, player2_id, player2_id])
        
        # Возвращаем покемонов противника
        cursor.execute('''
            SELECT пп.id_покемона_игрока, п.имя, п.стихия, пп.уровень,
                пб.текущее_hp, п.базовое_hp, п.базовая_атака, п.базовая_защита, п.базовая_скорость
            FROM Покемон_в_бою пб
            JOIN Покемоны_игрока пп ON пб.id_покемона_игрока = пп.id_покемона_игрока
            JOIN Покемоны п ON пп.id_покемона = п.id_покемона
            WHERE пб.id_сессии = ? AND пб.id_игрока = ?
        ''', [battle_id, player2_id])
        
        enemy_team = [
            {'id': r[0], 'имя': r[1], 'стихия': r[2], 'уровень': r[3],
            'текущее_hp': r[4], 'базовое_hp': r[5], 'атака': r[6],
            'защита': r[7], 'скорость': r[8]}
            for r in cursor.fetchall()
        ]
        
        conn.commit()
        conn.close()
        return {'battle_id': battle_id, 'enemy_team': enemy_team}
    
    def enemy_auto_switch(self, battle_id, enemy_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        # Выбираем лучшего покемона на бенче одним SQL
        cursor.execute('''
            SELECT пб.id_покемона_в_бою, п.имя, п.стихия
            FROM Покемон_в_бою пб
            JOIN Покемоны_игрока пи ON пб.id_покемона_игрока = пи.id_покемона_игрока
            JOIN Покемоны п ON пи.id_покемона = п.id_покемона
            WHERE пб.id_сессии = ? AND пб.id_игрока = ? 
            AND пб.статус_в_бою = 'bench' AND пб.текущее_hp > 0
            ORDER BY 
                CASE 
                    WHEN п.стихия = (
                        SELECT CASE п2.стихия 
                            WHEN 'fire' THEN 'grass' WHEN 'water' THEN 'fire'
                            WHEN 'grass' THEN 'water' WHEN 'electric' THEN 'water' END
                        FROM Покемон_в_бою пб2
                        JOIN Покемоны_игрока пи2 ON пб2.id_покемона_игрока = пи2.id_покемона_игрока
                        JOIN Покемоны п2 ON пи2.id_покемона = п2.id_покемона
                        WHERE пб2.id_сессии = ? AND пб2.id_игрока != ? AND пб2.статус_в_бою = 'active'
                    ) THEN 2
                    WHEN п.стихия = (
                        SELECT CASE п2.стихия
                            WHEN 'fire' THEN 'water' WHEN 'water' THEN 'grass'
                            WHEN 'grass' THEN 'fire' END
                        FROM Покемон_в_бою пб2
                        JOIN Покемоны_игрока пи2 ON пб2.id_покемона_игрока = пи2.id_покемона_игрока
                        JOIN Покемоны п2 ON пи2.id_покемона = п2.id_покемона
                        WHERE пб2.id_сессии = ? AND пб2.id_игрока != ? AND пб2.статус_в_бою = 'active'
                    ) THEN 0
                    ELSE 1
                END DESC,
                пб.текущее_hp DESC
            LIMIT 1
        ''', [battle_id, enemy_id, battle_id, enemy_id, battle_id, enemy_id])
        
        best = cursor.fetchone()
        
        if not best:
            conn.close()
            return {'status': 'no_pokemons'}
        
        # Меняем
        cursor.execute('''
            UPDATE Покемон_в_бою SET статус_в_бою = 'bench'
            WHERE id_сессии = ? AND id_игрока = ? AND статус_в_бою = 'active'
        ''', [battle_id, enemy_id])
        
        cursor.execute('''
            UPDATE Покемон_в_бою SET статус_в_бою = 'active'
            WHERE id_покемона_в_бою = ?
        ''', [best[0]])
        
        conn.commit()
        conn.close()
        
        return {
            'status': 'switched',
            'new_pokemon': best[1],
            'new_type': best[2]
        }

    def enemy_random_attack(self, battle_id, enemy_id):#async рандом атака бота
        conn = self.connect()
        cursor = conn.cursor()
        
        # Находим активного покемона противника
        cursor.execute('''
            SELECT п.id_покемона, п.имя
            FROM Покемон_в_бою пб
            JOIN Покемоны_игрока пи ON пб.id_покемона_игрока = пи.id_покемона_игрока
            JOIN Покемоны п ON пи.id_покемона = п.id_покемона
            WHERE пб.id_сессии = ? AND пб.id_игрока = ? AND пб.статус_в_бою = 'active'
        ''', [battle_id, enemy_id])
        
        result = cursor.fetchone()
        if not result:
            conn.close()
            return {'error': 'Нет активного покемона'}
        
        pokemon_id = result[0]
        pokemon_name = result[1]
        
        # Рандомная атака этого покемона
        cursor.execute('''
            SELECT a.id_атаки, a.название, a.сила, a.стихия
            FROM Атаки a
            JOIN Атаки_покемонов ap ON a.id_атаки = ap.id_атаки
            WHERE ap.id_покемона = ?
            ORDER BY RANDOM()
            LIMIT 1
        ''', [pokemon_id])
        
        attack = cursor.fetchone()
        conn.close()
        
        if not attack:
            return {'error': 'Нет атак'}
        
        attack_result = self.perform_attack(battle_id, enemy_id, attack[0])
        
        # Добавляем имя покемона к результату
        if attack_result and isinstance(attack_result, dict):
            attack_result['pokemon_name'] = pokemon_name
        
        return attack_result

#==============================================blitz-battle==============================================#
    def challenge_player(self, challenger_id, target_id, team1):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            DELETE FROM Игровая_сессия 
            WHERE (id_игрока1=? OR id_игрока2=? OR id_игрока1=? OR id_игрока2=?) 
            AND статус='waiting'
        ''', [challenger_id, challenger_id, target_id, target_id])
        
        cursor.execute(
            "INSERT INTO Игровая_сессия (id_игрока1, id_игрока2, статус) VALUES (?, ?, 'waiting')",
            [challenger_id, target_id]
        )
        battle_id = cursor.lastrowid
        
        placeholders = ','.join('?' * len(team1))
        cursor.execute(f'''
            INSERT INTO Покемон_в_бою (id_сессии, id_покемона_игрока, id_игрока, текущее_hp, статус_в_бою, позиция)
            SELECT ?, пп.id_покемона_игрока, ?, пп.текущее_hp,
                CASE WHEN ROW_NUMBER() OVER (ORDER BY пп.id_покемона_игрока) = 1 
                    THEN 'active' ELSE 'bench' END,
                ROW_NUMBER() OVER (ORDER BY пп.id_покемона_игрока)
            FROM Покемоны_игрока пп
            JOIN Покемоны п ON пп.id_покемона = п.id_покемона
            WHERE пп.id_игрока = ? AND п.имя IN ({placeholders})
        ''', [battle_id, challenger_id, challenger_id] + team1)
        
        conn.commit()
        conn.close()
        return {'battle_id': battle_id}

    def check_challenge(self, player_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id_сессии FROM Игровая_сессия
            WHERE id_игрока2 = ? AND статус = 'waiting'
        ''', [player_id])
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {'called': True, 'battle_id': result[0]}
        return {'called': False}

    def accept_challenge(self, battle_id, player_id, team2):
        conn = self.connect()
        cursor = conn.cursor()
        
        # Получаем участников
        cursor.execute("SELECT id_игрока1, id_игрока2 FROM Игровая_сессия WHERE id_сессии = ?", [battle_id])
        session = cursor.fetchone()
        player1_id = session[0]
        player2_id = session[1]
        
        # Записываем покемонов игрока 2
        position = 1
        for name in team2:
            cursor.execute('''
                SELECT пп.id_покемона_игрока, пп.текущее_hp
                FROM Покемоны_игрока пп
                JOIN Покемоны п ON пп.id_покемона = п.id_покемона
                WHERE пп.id_игрока = ? AND п.имя = ?
            ''', [player2_id, name])
            result = cursor.fetchone()
            if result:
                status = 'active' if position == 1 else 'bench'
                cursor.execute('''
                    INSERT INTO Покемон_в_бою (id_сессии, id_покемона_игрока, id_игрока, текущее_hp, статус_в_бою, позиция)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', [battle_id, result[0], player2_id, result[1], status, position])
                position += 1
        
        # Активируем бой
        cursor.execute("UPDATE Игровая_сессия SET статус = 'active' WHERE id_сессии = ?", [battle_id])
        cursor.execute("UPDATE Игрок SET статус = 'in_battle' WHERE id_игрока = ?", [player1_id])
        cursor.execute("UPDATE Игрок SET статус = 'in_battle' WHERE id_игрока = ?", [player2_id])
        
        conn.commit()
        conn.close()
        return {'status': 'ok'}

    def cancel_challenge(self, battle_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id_игрока1, id_игрока2 FROM Игровая_сессия WHERE id_сессии = ?', [battle_id])
        session = cursor.fetchone()
        
        if session:
            cursor.execute("UPDATE Игрок SET статус = 'ready' WHERE id_игрока IN (?, ?)", [session[0], session[1]])
        
        cursor.execute('DELETE FROM Ход_боя WHERE id_сессии = ?', [battle_id])
        cursor.execute('DELETE FROM Покемон_в_бою WHERE id_сессии = ?', [battle_id])
        cursor.execute('DELETE FROM Игровая_сессия WHERE id_сессии = ?', [battle_id])
        
        conn.commit()
        conn.close()
        return {'status': 'cancelled'}

    def check_battle_start(self, player_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id_сессии FROM Игровая_сессия
            WHERE (id_игрока1 = ? OR id_игрока2 = ?) AND статус = 'active'
        ''', [player_id, player_id])
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {'active': True, 'battle_id': result[0]}
        return {'active': False}

    def check_enemy_turn(self, battle_id, player_id, last_turn):
        conn = self.connect()
        cursor = conn.cursor()
        last_turn = int(last_turn) if last_turn else 0
        
        cursor.execute('''
            SELECT 
                с.статус,
                с.победитель,
                х.номер_хода,
                х.урон,
                а.название,
                (SELECT CASE WHEN пб.текущее_hp <= 0 THEN 1 ELSE 0 END
                FROM Покемон_в_бою пб 
                WHERE пб.id_покемона_в_бою = х.id_защищающегося) AS defender_fainted,
                (SELECT п.имя FROM Покемон_в_бою пб
                JOIN Покемоны_игрока пи ON пб.id_покемона_игрока = пи.id_покемона_игрока
                JOIN Покемоны п ON пи.id_покемона = п.id_покемона
                WHERE пб.id_сессии = ? AND пб.id_игрока != ? AND пб.статус_в_бою = 'active') AS enemy_active,
                (SELECT пб.текущее_hp FROM Покемон_в_бою пб
                WHERE пб.id_сессии = ? AND пб.id_игрока = ? AND пб.статус_в_бою = 'active') AS my_hp,
                (SELECT п.базовое_hp FROM Покемон_в_бою пб
                JOIN Покемоны_игрока пи ON пб.id_покемона_игрока = пи.id_покемона_игрока
                JOIN Покемоны п ON пи.id_покемона = п.id_покемона
                WHERE пб.id_сессии = ? AND пб.id_игрока = ? AND пб.статус_в_бою = 'active') AS my_max_hp,
                (SELECT пб.текущее_hp FROM Покемон_в_бою пб
                WHERE пб.id_сессии = ? AND пб.id_игрока != ? AND пб.статус_в_бою = 'active') AS enemy_hp,
                (SELECT п.базовое_hp FROM Покемон_в_бою пб
                JOIN Покемоны_игрока пи ON пб.id_покемона_игрока = пи.id_покемона_игрока
                JOIN Покемоны п ON пи.id_покемона = п.id_покемона
                WHERE пб.id_сессии = ? AND пб.id_игрока != ? AND пб.статус_в_бою = 'active') AS enemy_max_hp,
                (SELECT COUNT(*) FROM Покемон_в_бою
                WHERE id_сессии = ? AND id_игрока = ? AND статус_в_бою != 'fainted' AND текущее_hp > 0) AS my_alive,
                (SELECT COUNT(*) FROM Покемон_в_бою
                WHERE id_сессии = ? AND id_игрока = ? AND статус_в_бою != 'fainted' AND текущее_hp > 0) AS enemy_alive
            FROM Игровая_сессия с
            LEFT JOIN Ход_боя х ON х.id_сессии = с.id_сессии 
                AND х.номер_хода = (
                    SELECT MAX(номер_хода) FROM Ход_боя 
                    WHERE id_сессии = с.id_сессии AND номер_хода > ? AND id_игрока != ?
                )
            LEFT JOIN Атаки а ON х.id_атаки = а.id_атаки
            WHERE с.id_сессии = ?
        ''', [
            battle_id, player_id,          # enemy_active
            battle_id, player_id,          # my_hp
            battle_id, player_id,          # my_max_hp
            battle_id, player_id,          # enemy_hp
            battle_id, player_id,          # enemy_max_hp
            battle_id, player_id,          # my_alive
            battle_id, player_id,          # enemy_alive
            last_turn, player_id,          # в JOIN для поиска хода
            battle_id                      # WHERE с.id_сессии
        ])
        
        row = cursor.fetchone()
        conn.close()
        
        if not row or row[0] == 'finished':
            return {
                'battle_finished': True,
                'winner_id': row[1] if row else None,
                'enemy_attacked': False,
                'enemy_active_pokemon': None
            }
        
        result = {
            'battle_finished': False,
            'enemy_active_pokemon': row[6],
            'my_current_hp': row[7],
            'my_max_hp': row[8],
            'enemy_current_hp': row[9],
            'enemy_max_hp': row[10],
            'my_all_fainted': row[11] == 0,
            'enemy_all_fainted': row[12] == 0,
            'enemy_attacked': row[2] is not None,
            'attack_name': row[4],
            'damage': row[3],
            'turn': row[2],
            'defender_fainted': bool(row[5])
        }
        
        return result

    def use_potion(self, player_id, item_id, battle_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE Покемон_в_бою
            SET текущее_hp = MIN(
                (SELECT базовое_hp FROM Покемоны п 
                JOIN Покемоны_игрока пи ON п.id_покемона = пи.id_покемона 
                WHERE пи.id_покемона_игрока = Покемон_в_бою.id_покемона_игрока),
                текущее_hp + (SELECT эффект FROM Предметы WHERE id_предмета = ?)
            )
            WHERE id_сессии = ? AND id_игрока = ? AND статус_в_бою = 'active'
            AND EXISTS (SELECT 1 FROM Инвентарь WHERE id_игрока = ? AND id_предмета = ? AND количество > 0)
        ''', [item_id, battle_id, player_id, player_id, item_id])
        
        if cursor.rowcount == 0:
            conn.close()
            return {'status': 'error', 'message': 'Нет зелья или покемона'}
        
        # Списываем зелье
        cursor.execute('''
            UPDATE Инвентарь SET количество = количество - 1
            WHERE id_игрока = ? AND id_предмета = ?
        ''', [player_id, item_id])
        
        # Запись в лог
        cursor.execute('''
            INSERT INTO Ход_боя (id_сессии, номер_хода, id_игрока, id_защищающегося, id_атаки, урон)
            SELECT ?, 
                COALESCE((SELECT MAX(номер_хода) FROM Ход_боя WHERE id_сессии = ?), 0) + 1,
                ?,
                пб.id_покемона_в_бою,
                1,
                -(SELECT эффект FROM Предметы WHERE id_предмета = ?)
            FROM Покемон_в_бою пб
            WHERE пб.id_сессии = ? AND пб.id_игрока = ? AND пб.статус_в_бою = 'active'
        ''', [battle_id, battle_id, player_id, item_id, battle_id, player_id])
        
        # Получаем результат для ответа
        cursor.execute('''
            SELECT пб.текущее_hp, п.базовое_hp, пр.эффект
            FROM Покемон_в_бою пб
            JOIN Покемоны_игрока пи ON пб.id_покемона_игрока = пи.id_покемона_игрока
            JOIN Покемоны п ON пи.id_покемона = п.id_покемона
            JOIN Предметы пр ON пр.id_предмета = ?
            WHERE пб.id_сессии = ? AND пб.id_игрока = ? AND пб.статус_в_бою = 'active'
        ''', [item_id, battle_id, player_id])
        
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        
        return {
            'status': 'ok',
            'new_hp': row[0],
            'max_hp': row[1],
            'healed': row[2]
        }

    def get_inventory(self, player_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT json_group_array(
                json_object(
                    'id', пр.id_предмета,
                    'название', пр.название,
                    'эффект', пр.эффект,
                    'количество', инв.количество
                )
            )
            FROM Инвентарь инв
            JOIN Предметы пр ON инв.id_предмета = пр.id_предмета
            WHERE инв.id_игрока = ?
        ''', [player_id])
        
        result = cursor.fetchone()
        conn.close()
        
        return {'items': json.loads(result[0]) if result[0] else []}


    def buy_item(self, player_id, item_id):
        conn = self.connect()
        cursor = conn.cursor()
        
        # Списываем монеты только если хватает
        cursor.execute('''
            UPDATE Игрок SET монеты = монеты - (SELECT стоимость FROM Предметы WHERE id_предмета = ?)
            WHERE id_игрока = ? AND монеты >= (SELECT стоимость FROM Предметы WHERE id_предмета = ?)
        ''', [item_id, player_id, item_id])
        
        if cursor.rowcount == 0:
            conn.close()
            return {'status': 'error', 'message': 'Недостаточно монет'}
        
        # Добавляем или увеличиваем количество
        cursor.execute('''
            INSERT INTO Инвентарь (id_игрока, id_предмета, количество) VALUES (?, ?, 1)
            ON CONFLICT(id_игрока, id_предмета) DO UPDATE SET количество = количество + 1
        ''', [player_id, item_id])
        
        # Если ON CONFLICT не работает (нет UNIQUE), используй старый вариант:
        # cursor.execute("SELECT id_инвентаря FROM Инвентарь WHERE id_игрока = ? AND id_предмета = ?", [player_id, item_id])
        # ...
        
        cursor.execute("SELECT монеты FROM Игрок WHERE id_игрока = ?", [player_id])
        coins = cursor.fetchone()[0]
        cursor.execute("SELECT название FROM Предметы WHERE id_предмета = ?", [item_id])
        name = cursor.fetchone()[0]
        
        conn.commit()
        conn.close()
        return {'status': 'ok', 'message': f'Куплено: {name}', 'new_balance': coins}