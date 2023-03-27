
import numpy as np
import random
import json


def simulate_date(json_path, num_person=20, num_loc=10, num_t=15):
    data = []
    # generate the transfer probabilities
    P = np.zeros([num_loc, num_loc])
    for i in range(num_loc):
        for j in range(num_loc):
            P[i, j] = 1/(abs(i-j) + 1)
        P[i, :] = P[i, :]/np.sum(P[i, :])

    P = np.cumsum(P, axis=1)
    loc_list = np.array([i for i in range(num_loc)])

    for i in range(num_person):
        # generate the time points that a person enter and leave the industrial parks
        time_list = sorted(random.sample(range(0, num_t), 2))
        data_tmp = []

        for t in range(0, num_t):
            if t < time_list[0] or t > time_list[1]:
                data_tmp.append(-1)  # -1 means the person does not appear
                continue

            if t == time_list[0]:
                loc_tmp = random.sample(range(0, num_loc), 1)[0]  # starting point
                data_tmp.append(loc_tmp)
                continue

            seed = random.uniform(0, 1)
            # generate next location according to transition probability
            loc_tmp = loc_list[P[data_tmp[-1], :] >= seed][0]
            data_tmp.append(loc_tmp)
        data.append(data_tmp)

    data = np.array(data)
    # np.save(npy_path, data)
    data2json(data.tolist(), json_path)

def data2json(data, json_path):
    t_len = 10
    json_dict = {}
    json_locs = {}
    json_chas = {}
    for idx, cha_tmp in enumerate(data):
        for tdx, loc_tmp in enumerate(cha_tmp):
            json_locs[f'LOC{loc_tmp+1}'] = [loc_tmp+1]
            if tdx == 0:
                json_chas[f'人物{idx+1}'] = []
            if loc_tmp > 0:
                json_chas[f'人物{idx+1}'].append({
                    'Start': tdx * t_len,
                    'End': (tdx + 1) * t_len,
                    'Session': loc_tmp+1
                })
    json_dict['Story'] = { 'Location': json_locs, 'Characters': json_chas }
    json_str = json.dumps(json_dict, ensure_ascii=False, indent=2)
    with open(json_path, 'w') as json_file:
        json_file.write(json_str)

def npy2json(npy_path, json_path):
    file = np.load(npy_path, allow_pickle = True)
    data = file.tolist()
    t_len = 10
    json_dict = {}
    json_locs = {}
    json_chas = {}
    for idx, cha_tmp in enumerate(data):
        for tdx, loc_tmp in enumerate(cha_tmp):
            json_locs[f'LOC{loc_tmp+1}'] = [loc_tmp+1]
            if tdx == 0:
                json_chas[f'人物{idx+1}'] = []
            json_chas[f'人物{idx+1}'].append({
                'Start': tdx * t_len,
                'End': (tdx + 1) * t_len,
                'Session': loc_tmp+1
            })
    json_dict['Story'] = { 'Location': json_locs, 'Characters': json_chas }
    json_str = json.dumps(json_dict, ensure_ascii=False, indent=2)
    with open(json_path, 'w') as json_file:
        json_file.write(json_str)

if __name__ == '__main__':
    # 路径
    num_person = 20      # number of person appeared in the parks
    num_loc = 100         # number of locations
    num_t = 1000           # number of sampled time points
    json_path = f'../data/sim/Simulation-{num_person}-{num_loc}-{num_t}.json'
    simulate_date(json_path, num_person, num_loc, num_t)