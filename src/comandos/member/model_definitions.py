from typing import Dict
from llama_api.schemas.models import ExllamaModel, LlamaCppModel

# ================== LLaMA.cpp models ================== #
airoboros_l2_13b_gguf = LlamaCppModel(
    model_path="TheBloke/Airoboros-L2-13B-2.1-GGUF",  # automatic download
    max_total_tokens=8192,
    rope_freq_base=26000,
    rope_freq_scale=0.5,
    n_gpu_layers=30,
    n_batch=8192,
)

mythomax_l2_kimiko_13b_gguf = LlamaCppModel(
    model_path="mythomax-l2-kimiko-v2-13b.Q4_K_S.gguf",  # manual download
    max_total_tokens=4096,
    n_gpu_layers=40,
    n_batch=4096,
)

open_llama_3b_v2_gguf = LlamaCppModel(
    model_path="open-llama-3b-v2-q4_0.gguf",  # manual download
    max_total_tokens=2048,
    n_gpu_layers=-1,
)

llama_3_2_3b_q4_0 = LlamaCppModel(
    model_path="models/gguf/llama-3.2-3b-q4_0.gguf",  # ruta local
    max_total_tokens=2048,
    n_gpu_layers=35,
    n_batch=2048,
    temperature=0.7,
    top_p=0.95,
    top_k=40,
    repeat_penalty=1.1,
)

# ================== ExLLaMa models ================== #
orca_mini_7b = ExllamaModel(
    model_path="orca_mini_7b",  # manual download
    max_total_tokens=4096,
    compress_pos_emb=2.0,
)

chronos_hermes_13b_v2 = ExllamaModel(
    model_path="Austism/chronos-hermes-13b-v2-GPTQ",  # automatic download
    max_total_tokens=4096,
)

mythomax_l2_13b_gptq = ExllamaModel(
    model_path="TheBloke/MythoMax-L2-13B-GPTQ",  # automatic download
    max_total_tokens=4096,
)

# Define a mapping from OpenAI model names to LLaMA models.
openai_replacement_models: Dict[str, str] = {
    "gpt-3.5-turbo": "airoboros_l2_13b_gguf",
    "gpt-4": "mythomax_l2_13b_gptq",
}

# Registro de modelos disponibles
available_models: Dict[str, object] = {
    "airoboros_l2_13b_gguf": airoboros_l2_13b_gguf,
    "mythomax_l2_kimiko_13b_gguf": mythomax_l2_kimiko_13b_gguf,
    "open_llama_3b_v2_gguf": open_llama_3b_v2_gguf,
    "llama-3.2-3b-q4_0": llama_3_2_3b_q4_0,
    "orca_mini_7b": orca_mini_7b,
    "chronos_hermes_13b_v2": chronos_hermes_13b_v2,
    "mythomax_l2_13b_gptq": mythomax_l2_13b_gptq,
}
